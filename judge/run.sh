#!/bin/sh
# Usage: ./run.sh <language> <source_file> <input_file>

set -eu

LANGUAGE="$1"
SRC_FILE="$2"
INPUT_FILE="$3"

# Ensure input file exists
if [ ! -f "$INPUT_FILE" ]; then
  echo "Input file not found: $INPUT_FILE" >&2
  exit 1
fi

case "$LANGUAGE" in
  java)
    # Expect Main.java
    if ! javac "$SRC_FILE" 2> /tmp/compile.err; then
      cat /tmp/compile.err >&2
      exit 100  # compilation error
    fi
    if ! java Main < "$INPUT_FILE"; then
      exit 101  # runtime error
    fi
    ;;

  python|python3)
    if ! python3 "$SRC_FILE" < "$INPUT_FILE"; then
      exit 101
    fi
    ;;

  cpp|c++|gpp)
    # Compile to /tmp/main
    if ! g++ "$SRC_FILE" -O2 -std=c++17 -o /tmp/main 2> /tmp/compile.err; then
      cat /tmp/compile.err >&2
      exit 100
    fi
    if ! /tmp/main < "$INPUT_FILE"; then
      exit 101
    fi
    ;;

  javascript|js|node)
    if ! node "$SRC_FILE" < "$INPUT_FILE"; then
      exit 101
    fi
    ;;

  *)
    echo "Unsupported language: $LANGUAGE" >&2
    exit 2
    ;;
esac