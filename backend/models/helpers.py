from bson import ObjectId


def doc(d):
    if d is None:
        return None
    out = {}
    for k, v in d.items():
        if k == "_id":
            out["id"] = str(v)
        elif isinstance(v, ObjectId):
            out[k] = str(v)
        else:
            out[k] = v
    return out


def docs(lst):
    return [doc(d) for d in lst]
