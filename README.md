fluent-gas-dashboard
====================

fluent-gas-dashboard is a [Google Spreadsheet](https://docs.google.com/spreadsheet/ccc?key=0AtBJDW02Hvh9dHUtZFlPQ0FRRGltY3dHb3hWaE11Wmc#gid=206) that is designed to receive Fluentd event logs and display charts from them.

## Getting Started:

Publish a Google Apps Script Endpoint URL

1. Open [this spreadsheet](https://docs.google.com/spreadsheet/ccc?key=0AtBJDW02Hvh9dHUtZFlPQ0FRRGltY3dHb3hWaE11Wmc#gid=206) and select `File` - `Make a copy` menu to make a copy of it
2. Copy the URL of the copied spreadsheet to clipboard
3. Select `Tools` - `Script editor...` menu
4. On the Script editor, open `fluent_listener.gs`. Paste the copied URL on the place of `<<PLEASE PUT YOUR SPREADSHEET URL HERE>>`. Select `File` - `Save` menu to save the file
5. Select `Publish` - `Deploy as web app...`
6. On the `Deploy as web app` dialog, enter `1` in the `Project version` field and click `Save New Version`, select `anyone including allowing anonymous access` on the `Who has access to the app` menu, and click `Deploy` button
7. Select the `Current web app URL`. This is the endpoint URL for receiving event logs from Fluentd. Copy and paste the URL to clipboard or anywhere to use it later
8. Select `Run` - `doPost` menu, click `Continue` button of the `Authorization Required` dialog and click `Accept` button on the `Request for Permission` dialog
9. Confirm that there are `test` and `test_LINE` sheets appeared on the spreadsheet. Now it's ready to accept event logs from Fluentd

### Option A: Use with `fluentd-norikra-gas` Docker image:

In this option, you can use the spreadsheet as a dashboard for [Norikra](http://norikra.github.io/), a Complex Event Processing (CEP) tool that let you use SQL for fast and scalable event log aggregation.

1. [Configure a host for Fluentd installation](https://www.google.com/url?q=http://docs.fluentd.org/articles/before-install&usd=2&usg=ALhdy2-Eq3wSUPNxaZr13oC2Mt5UssbUhw)
2. [Prepare a Docker environment](https://www.google.com/url?q=https://www.docker.io/&usd=2&usg=ALhdy2-uNZKLM-jQQXncnc5eKHG-11c4og)
3. Execute the following docker command with putting the endpoint URL at the place of `<<ENDPOINT URL>>`

```
$ sudo docker run -p 26578:26578 -p 26571:26571 -p 24224:24224 -p 24224:24224/udp -e GAS_URL=<<ENDPOINT URL>> -t -i -d kazunori279/fluentd-norikra-gas
```

4. Now the host works as a Fluentd + Norikra server. Configure your Fluentd clients to forward logs to the host, and add Norikra queries by using its Web UI. The query result will be displayed as a new sheet on this spreadsheet. See [this site](http://norikra.github.io/) for details of Norikra

### Option B: Use with fluent-plugin-out-https:

In this option, you can use the spreadsheet as a dashboard for any event log collected by Fluentd. 

1. [Configure a host for Fluentd installation](https://www.google.com/url?q=http://docs.fluentd.org/articles/before-install&usd=2&usg=ALhdy2-Eq3wSUPNxaZr13oC2Mt5UssbUhw)
2. Download [fluent-plugin-out-https](https://www.google.com/url?q=https://github.com/kazunori279/fluent-plugin-out-https&usd=2&usg=ALhdy28zgZOuf3L6f8uw3RZDVZefvDH1eA)
3. Copy `/lib/fluent/plugin/out_https.rb` into `/plugin` directory of your Fluentd installation
4. Edit `td-agent.conf` to add the following match element. Replace the `<<ENDPOINT URL>>` with your endpoint URL and edit the `**` pattern if needed. Save the file and restart td-agent

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

- The spreadsheet can only receive one event log per a few seconds for each sheet. You can use it for receiving aggregated statistics (such as req/s, average CPU/memory usage etc) every few seconds, rather than using it for receiving the raw streaming events. Recommended event rate is 1 event per 3 seconds for each sheet.
- When the spreadsheet receive an event log with a new tag name, it creates a new sheet with the Fluentd tag name (or Norikra query name)
- If the tag name has a suffix `_AREA`, `_BAR`, `_COLUMN`, `_LINE`, `_SCATTER`, or `_TABLE`, it will also create a new sheet with a specified chart
- If the tag name has a suffix `_AREA_STACKED`, `_BAR_STACKED` or `_COLUMN_STACKED`, it will create a stacked chart
- The endpoint URL does not support authentication. Please make sure to keep the URL secret and not to make it public
