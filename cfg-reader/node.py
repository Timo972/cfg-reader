import enum
# Using enum class create enumerations


class Type(enum.Enum):
   NONE = 0
   SCALAR = 1
   LIST = 2
   DICT = 3


class Node:
    def __init__(self, value):
        self.value = value
        self.type = 0

    def is_none(self):
        return self.type == Type.NONE

    def is_scalar(self):
        return self.type == Type.SCALAR

    def is_list(self):
        return self.type == Type.LIST

    def is_dict(self):
        return self.type == Type.DICT

    def to_bool(self):
        if self.value == "yes" or self.value == "true":
            return True
        elif self.value == "no" or self.value == "false":
            return False
        else:
            raise Exception("could not convert to bool")

    def to_number(self):
        return int(self.value)

    def to_string(self):
        return self.value

    def to_dict(self):
        return self.value

    def to_list(self):
        return self.value