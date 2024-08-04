#!/bin/bash
set -e

mysql --host=localhost --user=root --password=root todo <<'EOF'
GRANT ALL PRIVILEGES ON `todo`.* TO `todo`@`%`;
GRANT CREATE, ALTER, DROP, REFERENCES ON *.* TO `todo`@`%`;
EOF
