#!/bin/sh

if [[ -z ${1} ]]; then
  echo 'Missing url file argument to siege'
  exit 1;
fi

first=`sysctl -e net.inet.ip.portrange.first`
last=`sysctl -e net.inet.ip.portrange.last`
msl=`sysctl -e net.inet.tcp.msl`

echo 'Setting portange and msl to relaxed values'
sudo sysctl -w net.inet.ip.portrange.first=5000
sudo sysctl -w net.inet.ip.portrange.last=65535
sudo sysctl -w net.inet.tcp.msl=1000

args=( "$@" )

siege -R ./test/.siegerc -f ./test/mocks/"${1}" "${args[@]:1}"

echo "Restoring previous portrange and msl configuration\n"
sudo sysctl -w "$first"
sudo sysctl -w "$last"
sudo sysctl -w "$msl"