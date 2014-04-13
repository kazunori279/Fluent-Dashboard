Fluent Dashboard
====================

Fluent Dashboard is a Google Spreadsheet that receives Fluentd event logs and display charts from them. [Demo video and instruction](https://github.com/kazunori279/Fluent-Dashboard/blob/master/demo_instruction.md) is also available.

## Features

- It's a Google Spreadsheet: hosted by Google at free, easy to customize and integrate with your business process even for non-programmers
- Real-time: If you hit your nginx from browser, Fluent Dashboard will draw a chart for it within 10 sec. Useful for watching how the system stats and service KPIs are moving when you have game or campaign events etc
- Integrated with [Norikra](https://github.com/norikra/norikra), CEP tool: my goal is to form the lambda architecture in combination with [Google BigQuery](https://cloud.google.com/products/bigquery/). You could get a merged view from 1) real-time continuous query on streaming data and 2) batch-based query on historical and large data set. No more worries for CPU consumption of your ElasticSearch

## Getting Started

To use the spreadsheet, you need to copy and configure it for receiving Fluentd event by its endpoint URL with the following steps.

1. Open [this spreadsheet](https://docs.google.com/spreadsheets/d/1mRG77KeAdEhOspGh00R7tQaDLvXC1th1pbe8P3tXm2A) and select `File` - `Make a copy` menu to make a copy of it
2. Copy the URL of the copied spreadsheet to clipboard
3. Select `Tools` - `Script editor...` menu
4. On the Script editor, open `fluent_listener.gs`. Paste the copied URL on the place of `<<PLEASE PUT YOUR SPREADSHEET URL HERE>>`. Select `File` - `Save` menu to save the file
5. Select `Publish` - `Deploy as web app...`
6. On the `Deploy as web app` dialog, enter `1` in the `Project version` field and click `Save New Version`, select `Anyone, even anonymous` on the `Who has access to the app` menu, and click `Deploy` button
7. Select the `Current web app URL`. This is the endpoint URL for receiving event logs from Fluentd. Copy and paste the URL to clipboard or anywhere to use it later
8. Select `Run` - `doPost` menu, click `Continue` button of the `Authorization Required` dialog and click `Accept` button on the `Request for Permission` dialog
9. Confirm that there are a line chart appeared on the spreadsheet. Now it's ready to accept event logs from Fluentd

You can choose one from the two options to use the spreadsheet.

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
2. Install [fluent-plugin-https-json](https://github.com/jdoconnor/fluentd_https_out)
4. Edit `td-agent.conf` to add the following match element. Replace the `<<ENDPOINT URL>>` with your endpoint URL and edit the `**` pattern if needed. Save the file and restart td-agent

```td-agent.conf
    <match **>
        type            https_json
        use_https       true
        buffer_path     /tmp/buffer
        buffer_chunk_limit 256m
        buffer_queue_limit 128
        flush_interval  3s
        endpoint        <<ENDPOINT URL>>
    </match>
```

## Usage:

- The spreadsheet can only receive one event log per a few seconds for each sheet. You can use it for receiving aggregated statistics (such as req/s, average CPU/memory usage etc) every few seconds, rather than using it for receiving raw streaming events. Recommended event rate is 1 event per 3 seconds for each sheet.
- When the spreadsheet receive an event log with a new tag name, it creates a new sheet with the Fluentd tag name (or Norikra query name)
- If the tag name has a suffix `_AREA`, `_BAR`, `_COLUMN`, `_LINE`, `_SCATTER`, or `_TABLE`, it will also create a new sheet with a specified chart
- If the tag name has a suffix `_AREA_STACKED`, `_BAR_STACKED` or `_COLUMN_STACKED`, it will create a stacked chart
- The endpoint URL does not support authentication. Please make sure to keep the URL secret and not to make it public
