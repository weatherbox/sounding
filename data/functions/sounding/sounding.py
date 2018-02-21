import re, json
import datetime
import requests

endpoint = 'http://weather.uwyo.edu/cgi-bin/sounding?'


def main():
    data, time = fetch_all()

    filename = "sounding-" + time + ".json"
    with open(filename, 'w') as f:
        json.dump(data, f)


def fetch_all():
    year, month, dayh = last_datetime()
    time = year + month + dayh

    # JMA sounding points
    # http://www.jma.go.jp/jma/kishou/know/upper/kaisetsu.html#kososite
    ids = ['47401', '47412', '47418', '47582', '47600', '47646', '47678',
        '47741', '47778', '47807', '47827', '47909', 
        '47918', '47945', '47971', '47991',
        '47681', '47580'] # JASDF

    data = {}
    for id in ids:
        d = fetch_point(id, year, month, dayh)
        if d: data[id] = d

    data['time'] = time

    return data, time


def last_datetime():
    now = datetime.datetime.utcnow()
    last = now - datetime.timedelta(hours=2)
    year = str(last.year)
    month = last.strftime("%m")
    dayh = "{:0>2}{:0>2}".format(last.day, int(last.hour / 12) * 12)
    return year, month, dayh


def fetch_point(point_id, year, month, dayh):
    param = "YEAR={0}&MONTH={1}&FROM={2}&TO={2}&STNM={3}".format(year, month, dayh, point_id)
    url = endpoint + "TYPE=TEXT%3ALIST&" + param
    req = requests.get(url)
    

    # <H2>47778  Shionomisaki Observations at 12Z 26 Jan 2018</H2>
    h2 = re.findall(r"<H2>(.*?)</H2>", req.text)
    if len(h2) == 0:
        print("cannot get: " + url)
        return
    name = h2[0].split(' ')[2]
    print(url, h2[0])

    # <PRE>data</PRE>
    pre = re.findall(r"<PRE>(.*?)</PRE>", req.text, re.DOTALL)

    # sounding
    #-----------------------------------------------------------------------------
    #   PRES   HGHT   TEMP   DWPT   RELH   MIXR   DRCT   SKNT   THTA   THTE   THTV
    #   hPa     m      C      C      %    g/kg    deg   knot     K      K      K
    #-----------------------------------------------------------------------------
    rows = pre[0].splitlines()

    levels = {}
    for row in rows[5:]:
        d = row.split()
        df = [float(v) for v in d]
        pres = d[0]
        data = df[1:]

        if len(d) < 5:
            continue

        if len(d) == 7: # no dew point
            data = df[1:3] + [None, None, None] + df[3:6] + [None, df[6]]
        elif len(d) == 5: # no wind
            data = df[1:3] + [None, None, None, None, None, df[3], None, df[4]]
    
        # int 
        for i in [0, 3, 5, 6]:
            if data[i]:
                data[i] = int(data[i])

        levels[pres] = data

    # Station information and sounding indices
    # http://weather.uwyo.edu/upperair/indices.html
    infos = pre[1].splitlines()
    if infos[1].split(": ")[0].split()[1] == 'identifier':
        infos = infos[1:]
    info = [row.split(": ")[1] for row in infos[1:]]
    labels = [
        'ID', 'TIME', 'SLAT', 'SLON', 'SELV',
        'SHOW', 'LIFT', 'LFTV', 'SWEAT', 'KINX',
        'CTOT', 'VTOT', 'TTOT',
        'CAPE', 'CAPV', 'CINS', 'CINV',
        'EQLV', 'EQTV', 'LFCT', 'LFCV', 'BRCH', 'BRCV',
        'LCLT', 'LCLP', 'MLTH', 'MLMR',
        'THTK', 'PWAT'
    ]

    indices = {}
    for label, value in zip(labels, info):
        if label in ['ID', 'TIME']:
            indices[label] = value
        else:
            indices[label] = float(value)

    return { 'name': name, 'indices': indices, 'levels': levels }


if __name__ == '__main__':
    #fetch_point('47778')
    main()


