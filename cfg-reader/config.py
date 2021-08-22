from cfg_io import *
from node import *


class Config:
    def __init__(self, file_name: str):
        self.name = file_name
        self.node = read_file(file_name)

    def get(self, key: str):
        _dict = self.node.to_dict()

        node = _dict[key]

        if node is None:
            raise Exception("key not found")

        return convert(node)

    def set(self, key: str, value: any):
        node = Node(value)
        self.node[key] = node


def convert(node: Node):
    for i in range(5):
        if i == 0:
            _bool = node.to_bool()
            return _bool
        elif i == 1:
            _int = node.to_number()
            return _int
        elif i == 2:
            _str = node.to_string()
            return _str
        elif i == 3:
            _list = node.to_list()
            return _list
        elif i == 4:
            _dict = node.to_dict()
            return _dict
        else:
            return None
