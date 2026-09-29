#!/bin/bash
# usage: batch-compare.sh "<widths>" path1 path2 ...
W="$1"; shift
for p in "$@"; do
  r=$(CMP_PATH=$p MSYS_NO_PATHCONV=1 node compare.mjs $W 2>&1 | grep "^==" | sed "s#^#$p #")
  echo "$r"
done
