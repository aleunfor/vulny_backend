# src/scripts/scan.py
import subprocess
import os
import sys
import argparse

target_url = sys.argv[1]

# Set up argument parser
parser = argparse.ArgumentParser(
    description="Run OWASP ZAP scan using Docker.")
parser.add_argument('--target', required=True, help='Target URL to scan')
parser.add_argument('--userid', required=True, help='User ID')
parser.add_argument('--scanid', help='Scan ID')
parser.add_argument('--env', help='Environment', default='dev')

args = parser.parse_args()

project_root = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '../../'))
output_dir = os.path.join(project_root, 'output')

print(args.target, args.userid, args.scanid)

commandProd = [
    'sudo', 'docker', 'run', '--rm',
    '-v', f'{output_dir}:/zap/wrk',
    'owasp/zap2docker-stable',
    'zap-full-scan.py',
    '-t', args.target,
    '-J', f'{args.userid}-{args.scanid}-report.json'
]

commandDev = [
    'docker', 'run', '--rm',
    '-v', f'{output_dir}:/zap/wrk',
    'owasp/zap2docker-stable',
    'zap-full-scan.py',
    '-t', args.target,
    '-J', f'{args.userid}-{args.scanid}-report.json'
]

command = commandProd if args.env == 'production' else commandDev

try:
    subprocess.run(command, check=True)
    print("ZAP scan completed.")
except subprocess.CalledProcessError as e:
    print(f"ZAP scan failed: {e}")
    sys.exit(1)
