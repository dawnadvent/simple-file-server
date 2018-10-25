#!/bin/bash
home=$(cd `dirname $0`; pwd)
$home/bin/chfs --path="$home/shared" --port=2000 --log="$home/logs" --rule="::rwd|huke:123456:rwd"
