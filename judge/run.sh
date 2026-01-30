#!/bin/sh
# Usage: ./run.sh <language> <source_file> <input_file>
# So overall, this will take a language, a source file, and an input file as parameters while it is running. Based on the 
# language, it will run different compilers/ interpreters as defined in the below logic flow.
# filhal debugging chalu hai script ki.
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
    if ! javac "$SRC_FILE" 2> compile.err; then
      cat compile.err >&2
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
    # Compile to ./main
    if ! g++ "$SRC_FILE" -O2 -std=c++17 -o main 2> compile.err; then
      cat compile.err >&2
      exit 100
    fi
    if ! ./main < "$INPUT_FILE"; then
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
