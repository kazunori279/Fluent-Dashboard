# Demo instruction

The following is the procedure used in the [Fluent Dashboard demo video](https://www.youtube.com/watch?v=VPNMe4znWDo)

### create GCE instances on the console
* `demo-norikra`
* `demo-nginx`
* `demo-ab`

### login each instance and download Docker images

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

### run norikra in `demo-norikra`

```
> sudo docker run -p 26578:26578 -p 26571:26571 -p 24224:24224 -p 24224:24224/udp -e GAS_URL=https://script.google.com/macros/s/AKfycbzfd9Dch7COSbouTCozNzHxDAGz7l5-BxXqtOz1_kfrAJh9wJiG/exec -t -i -d kazunori279/fluentd-norikra-gas
```

### copy norikra external IP on the console

### show norikra page on browser

```
> http://<<NORIKRA EXT IP>>:26578/
```

### add a norikra query `nginx_rps_LINE`

```
select count(*) / 5 as rps 
from nginx_access.win:time(5 sec) 
output snapshot every 3 sec
```

### run nginx in `demo-nginx`

```
sudo docker run -e NORIKRA_IP=<<NORIKRA INT IP>> -p 80:80 -t -i -d kazunori279/fluentd-nginx
```

### copy nginx external IP

### show nginx default top page on browser

```
http://<<NGINX EXT IP>>
```

### run apache bench in `demo-ab`

```
sudo docker run -t -i kazunori279/ab
ab -c 100 -n 100000 http://<<NGINX EXT IP>>
```

### add a norikra query `dstat_cpu_AREA_STACKED`

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

### add a norikra query `dstat_net_BAR`

```
select 
  dstat.dstat.net_total.recv as recv, 
  dstat.dstat.net_total.send as send 
from dstat 
output snapshot every 3 sec
```
