fluent-gas-dashboard
====================

fluent-gas-dashboard is a [Google Spreadsheet](https://docs.google.com/spreadsheet/ccc?key=0AtBJDW02Hvh9dHUtZFlPQ0FRRGltY3dHb3hWaE11Wmc#gid=206) that is designed to receive Fluentd event logs and display charts from them.

## Getting Started:

Publish a Google Apps Script Endpoint URL

1. Open [this spreadsheet](https://docs.google.com/spreadsheet/ccc?key=0AtBJDW02Hvh9dHUtZFlPQ0FRRGltY3dHb3hWaE11Wmc#gid=206) and select `File` - `Make a copy` menu to make a copy of it
2. Select `Tools` - `Script editor...` menu
3. On the Script editor, select `Publish` - `Deploy as web app...`
4. On the `Deploy as web app` dialog, enter `1` in the `Project version` field and click `Save New Version`, select `anyone including allowing anonymous access`, and click `Deploy` button
5. Select the `Current web app URL`, copy it and paste the URL to anywhere you can keep it

### Option A: Use the Endpoint with `fluentd-norikra-gas` Docker image:
1. [Configure a host for Fluentd installation](https://www.google.com/url?q=http://docs.fluentd.org/articles/before-install&usd=2&usg=ALhdy2-Eq3wSUPNxaZr13oC2Mt5UssbUhw)
2. [Prepare a Docker environment](https://www.google.com/url?q=https://www.docker.io/&usd=2&usg=ALhdy2-uNZKLM-jQQXncnc5eKHG-11c4og)
3. Execute the following docker command with the Endpoint URL

```
$ sudo docker run -p 26578:26578 -p 26571:26571 -p 24224:24224 -p 24224:24224/udp -e GAS_URL=<<ENDPOINT URL>> -t -i -d kazunori279/fluentd-norikra-gas
```

4. Now the host works as a Fluentd + Norikra server. Configure your Fluentd clients to forward logs to the host, and add Norikra queries by using its Web UI. The query result will be displayed as a new sheet on this spreadsheet. See [this site](http://norikra.github.io/) for details of Norikra

### Option B: Use the Endpoint with fluent-plugin-out-https:
1. [Configure a host for Fluentd installation](https://www.google.com/url?q=http://docs.fluentd.org/articles/before-install&usd=2&usg=ALhdy2-Eq3wSUPNxaZr13oC2Mt5UssbUhw)
2. Download [fluent-plugin-out-https](https://www.google.com/url?q=https://github.com/kazunori279/fluent-plugin-out-https&usd=2&usg=ALhdy28zgZOuf3L6f8uw3RZDVZefvDH1eA)
3. Copy `/lib/fluent/plugin/out_https.rb` into `/plugin` directory of your Fluentd installation
4. Configure `td-agent.conf` to forward Fluentd logs to the endpoint and restart td-agent

```td-agent.conf
    <match **>
      type            http
      use_ssl         true
      include_tag     true
      include_timestamp true
      endpoint_url    <<ENDPOINT URL>>
      http_method     post
      serializer      form
    </match>
```

## Usage:

- The endpoint can only receive one event log per a few seconds. Do not use it for receiving streaming events. Recommended event rate is 1 event per 3 seconds
- When the endpoint receive a new event log, it creates a new sheet with the Fluentd tag name (or Norikra query name)
- If the tag name has a suffix `_AREA`, `_BAR`, `_COLUMN`, `_LINE`, `_SCATTER`, or `_TABLE`, it will also create a new sheet with a specified chart
- If the tag name has a suffix `_AREA_STACKED`, `_BAR_STACKED` or `_COLUMN_STACKED`, it will create a stacked chart
- The endpoint URL is not secured by authentication. Please make sure not to publish the URL to anywhere
