#!/usr/bin/env python3
"""
Process College Scorecard data into the format needed for the school similarity app.
"""

import csv
import json
import sys
from pathlib import Path

# Mapping of LOCALE codes to urban/rural labels
LOCALE_MAP = {
    '11': 'City - Large',
    '12': 'City - Midsize',
    '13': 'City - Small',
    '21': 'Suburb - Large',
    '22': 'Suburb - Midsize',
    '23': 'Suburb - Small',
    '31': 'Town - Fringe',
    '32': 'Town - Distant',
    '33': 'Town - Remote',
    '41': 'Rural - Fringe',
    '42': 'Rural - Distant',
    '43': 'Rural - Remote',
}

# Mapping of CONTROL codes to school type
CONTROL_MAP = {
    '1': 'Public',
    '2': 'Private Nonprofit',
    '3': 'Private For-Profit',
}

def safe_float(value, default=None):
    """Convert value to float, returning default if invalid."""
    if value in ('NULL', 'PrivacySuppressed', '', None):
        return default
    try:
        return float(value)
    except (ValueError, TypeError):
        return default

def safe_int(value, default=None):
    """Convert value to int, returning default if invalid."""
    f = safe_float(value, default)
    if f is None:
        return default
    return int(f)

def process_scorecard(input_file, output_file, min_students=500):
    """
    Process College Scorecard CSV and output JSON for the app.

    Args:
        input_file: Path to the College Scorecard CSV
        output_file: Path to output JSON file
        min_students: Minimum student population to include (filters small schools)
    """
    schools = []
    skipped = 0

    with open(input_file, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)

        for row in reader:
            # Skip schools without essential data
            sat_avg = safe_float(row.get('SAT_AVG'))
            act_avg = safe_float(row.get('ACTCMMID'))
            ugds = safe_float(row.get('UGDS'))

            # Must have at least SAT or ACT, and student population
            if (sat_avg is None and act_avg is None) or ugds is None:
                skipped += 1
                continue

            # Filter small schools
            if ugds < min_students:
                skipped += 1
                continue

            # Get graduation rate (C150_4 is 4-year rate, already as decimal)
            grad_rate = safe_float(row.get('C150_4'))
            if grad_rate is not None:
                grad_rate = round(grad_rate * 100, 1)  # Convert to percentage

            # Get acceptance rate (already as decimal)
            adm_rate = safe_float(row.get('ADM_RATE'))
            if adm_rate is not None:
                adm_rate = round(adm_rate * 100, 1)  # Convert to percentage

            # Get international student percentage (UGDS_NRA is decimal)
            intl_pct = safe_float(row.get('UGDS_NRA'))
            if intl_pct is not None:
                intl_pct = round(intl_pct * 100, 1)  # Convert to percentage

            # Get tuition (use in-state if public, out-of-state otherwise)
            control = row.get('CONTROL', '2')
            if control == '1':  # Public
                tuition = safe_float(row.get('TUITIONFEE_IN'))
            else:
                tuition = safe_float(row.get('TUITIONFEE_OUT'))

            # If no specific tuition, try the average cost
            if tuition is None:
                tuition = safe_float(row.get('COSTT4_A'))

            # Get net price as proxy for financial aid effect
            # Net price = Cost - Average Aid, so Aid = Cost - Net Price
            # Use total cost (COSTT4_A) for more accurate aid calculation
            total_cost = safe_float(row.get('COSTT4_A'))
            net_price = safe_float(row.get('NPT4_PUB' if control == '1' else 'NPT4_PRIV'))
            avg_aid = None
            if total_cost is not None and net_price is not None:
                avg_aid = max(0, int(total_cost - net_price))
            elif tuition is not None:
                # Estimate aid as ~35-40% of tuition for schools without net price data
                avg_aid = int(tuition * 0.35)

            # Get student-faculty ratio from STUFACR column if available
            stufac = safe_float(row.get('STUFACR'))
            if stufac is None:
                # Estimate from UGDS and AVGFACSAL if available
                stufac = 15  # Default assumption

            # Build school record
            school = {
                'school_id': safe_int(row.get('UNITID')),
                'school_name': row.get('INSTNM', 'Unknown'),
                'city': row.get('CITY', ''),
                'state': row.get('STABBR', ''),
                'avg_sat': safe_int(sat_avg) if sat_avg else None,
                'avg_act': safe_int(act_avg) if act_avg else None,
                'graduation_rate': grad_rate,
                'acceptance_rate': adm_rate,
                'student_faculty_ratio': round(stufac, 1) if stufac else None,
                'tuition_cost': safe_int(tuition),
                'avg_aid': safe_int(avg_aid),
                'student_population': safe_int(ugds),
                'international_percentage': intl_pct,
                'latitude': safe_float(row.get('LATITUDE')),
                'longitude': safe_float(row.get('LONGITUDE')),
                'ranking': None,  # Not available in scorecard
                'type': CONTROL_MAP.get(control, 'Unknown'),
                'urban_rural': LOCALE_MAP.get(row.get('LOCALE'), 'Unknown'),
                'website': row.get('INSTURL', ''),
            }

            # Skip if missing too many critical fields
            critical_fields = ['avg_sat', 'graduation_rate', 'tuition_cost']
            missing = sum(1 for f in critical_fields if school[f] is None)
            if missing > 1:
                skipped += 1
                continue

            # Fill in missing values with reasonable defaults
            if school['avg_sat'] is None and school['avg_act'] is not None:
                # Estimate SAT from ACT (rough conversion)
                school['avg_sat'] = int(school['avg_act'] * 47.5 - 90)
            elif school['avg_act'] is None and school['avg_sat'] is not None:
                # Estimate ACT from SAT
                school['avg_act'] = int((school['avg_sat'] + 90) / 47.5)

            if school['acceptance_rate'] is None:
                school['acceptance_rate'] = 50.0  # Default assumption

            if school['graduation_rate'] is None:
                school['graduation_rate'] = 50.0  # Default assumption

            if school['student_faculty_ratio'] is None:
                school['student_faculty_ratio'] = 15.0

            if school['avg_aid'] is None or school['avg_aid'] == 0:
                school['avg_aid'] = int(school['tuition_cost'] * 0.35) if school['tuition_cost'] else 5000

            if school['international_percentage'] is None:
                school['international_percentage'] = 5.0

            # Ranking will be computed after all schools are processed
            school['ranking'] = None

            schools.append(school)

    # Compute composite rankings based on multiple factors
    # Higher score = better school
    for school in schools:
        score = 0
        weights = 0

        # SAT score (normalized to 0-100)
        if school['avg_sat']:
            sat_score = (school['avg_sat'] - 800) / 800 * 100  # 800-1600 -> 0-100
            score += sat_score * 3  # Weight: 3x
            weights += 3

        # Graduation rate (already 0-100)
        if school['graduation_rate']:
            score += school['graduation_rate'] * 2  # Weight: 2x
            weights += 2

        # Acceptance rate (lower is better, so invert)
        if school['acceptance_rate']:
            acceptance_score = 100 - school['acceptance_rate']
            score += acceptance_score * 1.5  # Weight: 1.5x
            weights += 1.5

        # Student-faculty ratio (lower is better)
        if school['student_faculty_ratio']:
            ratio_score = max(0, 100 - school['student_faculty_ratio'] * 3)
            score += ratio_score * 0.5  # Weight: 0.5x
            weights += 0.5

        school['_composite_score'] = score / weights if weights > 0 else 0

    # Sort by composite score and assign rankings
    schools.sort(key=lambda x: x.get('_composite_score', 0), reverse=True)
    for i, school in enumerate(schools):
        school['ranking'] = i + 1
        del school['_composite_score']

    # Sort by student population (larger schools first)
    schools.sort(key=lambda x: x['student_population'] or 0, reverse=True)

    # Write output
    with open(output_file, 'w') as f:
        json.dump(schools, f, indent=2)

    print(f"Processed {len(schools)} schools (skipped {skipped})")
    print(f"Output written to {output_file}")

    # Print some stats
    sat_scores = [s['avg_sat'] for s in schools if s['avg_sat']]
    if sat_scores:
        print(f"SAT range: {min(sat_scores)} - {max(sat_scores)}")

    populations = [s['student_population'] for s in schools if s['student_population']]
    if populations:
        print(f"Population range: {min(populations):,} - {max(populations):,}")

if __name__ == '__main__':
    input_file = sys.argv[1] if len(sys.argv) > 1 else 'Most-Recent-Cohorts-Institution_05192025.csv'
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'public/data/schools.json'

    process_scorecard(input_file, output_file)
