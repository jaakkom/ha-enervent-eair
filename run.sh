#!/usr/bin/with-contenv bashio
CONFIG_PATH=/data/options.json

export SERIALNUMBER="$(jq --raw-output '.serialnumber' $CONFIG_PATH)"
export PIN="$(jq --raw-output '.pin' $CONFIG_PATH)"
export URL="$(jq --raw-output '.url' $CONFIG_PATH)"
export DEVICE_ID="$(jq --raw-output '.device_id' $CONFIG_PATH)"
export DEVICE_MODEL="$(jq --raw-output '.device_model' $CONFIG_PATH)"

export MQTT_SERVER="$(jq --raw-output '.mqtt_server' $CONFIG_PATH)"
export MQTT_USER="$(jq --raw-output '.mqtt_user' $CONFIG_PATH)"
export MQTT_PASS="$(jq --raw-output '.mqtt_pass' $CONFIG_PATH)"
export MQTT_CLIENT_ID="$(jq --raw-output '.mqtt_client_id' $CONFIG_PATH)"
export MQTT_DISCOVERY_PREFIX="$(jq --raw-output '.mqtt_discovery_prefix' $CONFIG_PATH)"

node -v
npm -v

npm run start