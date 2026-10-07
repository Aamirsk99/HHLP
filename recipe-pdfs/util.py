"""Helpers shared by the recipe family modules."""
from catalog import CAT
from core import parse_list


def short(key):
    n = CAT[key]['name'].split(' (')[0].lower()
    return n.replace('fresh ', '')


def names(spec, skip=('salt', 'water', 'oil', 'ghee', 'blacksalt', 'ice')):
    """'onion 50; tomato 50' -> 'onion and tomato'."""
    ks = []
    for k, _, _ in parse_list(spec):
        if k not in skip and CAT[k]['cat'] != 'spice':
            n = short(k)
            if n not in ks:
                ks.append(n)
    return join(ks)


def spices(spec):
    ks = []
    for k, _, _ in parse_list(spec):
        if CAT[k]['cat'] == 'spice' or k in ('salt',):
            n = short(k)
            if n not in ks:
                ks.append(n)
    return join(ks)


def join(ls):
    ls = [x for x in ls if x]
    if not ls:
        return ''
    if len(ls) == 1:
        return ls[0]
    return ', '.join(ls[:-1]) + ' and ' + ls[-1]


def cap(s):
    return s[0].upper() + s[1:] if s else s


def allnames(spec, skip=('salt', 'water', 'oil', 'ghee', 'coconutoil', 'mustardoil', 'sesameoil', 'oliveoil', 'mustard')):
    """Every ingredient name in a spec, spices included (oils and mustard seeds left out)."""
    ks = []
    for k, _, _ in parse_list(spec):
        if k not in skip:
            n = short(k)
            if n not in ks:
                ks.append(n)
    return join(ks)


def produce(spec):
    """Only the fresh produce in a spec (vegetables, fruit, greens, herbs) - the things you wash and chop."""
    ks = []
    for k, _, _ in parse_list(spec):
        if CAT[k]['cat'] in ('veg', 'fruit', 'leafy', 'aro') and k not in ('lemon', 'tamarind', 'kokum'):
            n = short(k)
            if n not in ks:
                ks.append(n)
    return join(ks)
