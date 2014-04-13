# Demo instruction

The following is the procedure used in the [Fluent Dashboard demo video](https://www.youtube.com/watch?v=VPNMe4znWDo)

### Prepare one copy of Fluent Dashboard

Prepare one copy of Fluent Dashboard with the instruction on the README.

### Create GCE instances on the console

The demo uses a customized GCE image that has Debian + Docker installed. Create three instances for Norikra, nginx and Apache Bench.

* `demo-norikra`
* `demo-nginx`
* `demo-ab`

### Log into each instance and download Docker images

```
> gcutil ssh demo-norikra
> sudo docker pull kazunori279/fluentd-norikra-gas
```

```
> gcutil ssh demo-nginx
> sudo docker pull kazunori279/fluentd-nginx
```

```
> gcutil ssh demo-ab
> sudo docker pull kazunori279/ab
```

### Run norikra in `demo-norikra`

Please replace <<YOUR DASHBOARD ENDPOINT URL>> with your endpoint URL.

```
> sudo docker run -p 26578:26578 -p 26571:26571 -p 24224:24224 -p 24224:24224/udp -e GAS_URL=<<YOUR DASHBOARD ENDPOINT URL>> -t -i -d kazunori279/fluentd-norikra-gas
```

### Copy norikra external IP on the console

### Show norikra page on browser

```
> http://<<NORIKRA EXT IP>>:26578/
```

### Add a norikra query `nginx_rps_LINE`

```
select count(*) / 5 as rps 
from nginx_access.win:time(5 sec) 
output snapshot every 3 sec
```

### Copy norikra internal IP on the console

### Run nginx in `demo-nginx`

```
sudo docker run -e NORIKRA_IP=<<NORIKRA INT IP>> -p 80:80 -t -i -d kazunori279/fluentd-nginx
```

### Copy nginx external IP

### Show nginx default top page on browser

```
http://<<NGINX EXT IP>>
```

### Run apache bench in `demo-ab`

```
sudo docker run -t -i kazunori279/ab
ab -c 100 -n 100000 http://<<NGINX EXT IP>>
```

### Add a norikra query `dstat_cpu_AREA_STACKED`

```
select 
  dstat.dstat.total_cpu_usage.usr as usr, 
  dstat.dstat.total_cpu_usage.sys as sys, 
  dstat.dstat.total_cpu_usage.wai as wai, 
  dstat.dstat.total_cpu_usage.hiq as hiq, 
  dstat.dstat.total_cpu_usage.siq as siq 
from dstat.win:time(5 sec) 
output snapshot every 3 sec
```

### Add a norikra query `dstat_net_BAR`

```
select 
  dstat.dstat.net_total.recv as recv, 
  dstat.dstat.net_total.send as send 
from dstat 
output snapshot every 3 sec
```
