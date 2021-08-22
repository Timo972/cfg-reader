from .io import *
from .node import *
from .emitter import *


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

    def serialize(self, use_commas: bool = False, use_apostrophes: bool = False):
        emitter = Emitter()
        emitter.emit(self.node, 0, True, use_commas, use_apostrophes)
        return emitter.get_string()

    def save(self, use_commas: bool = False, use_apostrophes: bool = False):
        emitter = Emitter()
        emitter.emit(self.node, 0, True, use_commas, use_apostrophes)
        write_file(self.name, emitter.get_string())

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
