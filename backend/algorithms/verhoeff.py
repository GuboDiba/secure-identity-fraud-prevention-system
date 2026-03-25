# Verhoeff algorithm tables
d_table = [
    [0,1,2,3,4,5,6,7,8,9],
    [1,2,3,4,0,6,7,8,9,5],
    [2,3,4,0,1,7,8,9,5,6],
    [3,4,0,1,2,8,9,5,6,7],
    [4,0,1,2,3,9,5,6,7,8],
    [5,9,8,7,6,0,4,3,2,1],
    [6,5,9,8,7,1,0,4,3,2],
    [7,6,5,9,8,2,1,0,4,3],
    [8,7,6,5,9,3,2,1,0,4],
    [9,8,7,6,5,4,3,2,1,0]
]

p_table = [
    [0,1,2,3,4,5,6,7,8,9],
    [1,5,9,3,7,0,4,8,2,6],
    [2,8,5,0,7,3,9,6,1,4],
    [3,9,0,6,8,2,7,5,4,1],
    [4,2,6,8,1,9,3,7,5,0],
    [5,7,3,9,2,8,0,4,6,1],
    [6,0,4,2,9,5,8,1,3,7],
    [7,3,1,4,6,9,5,0,8,2],
    [8,6,7,1,3,5,2,9,0,4],
    [9,4,8,5,0,7,1,3,6,2]
]

inv_table = [0,4,3,2,1,5,6,7,8,9]


def verhoeff_checksum(num_str):
    c = 0
    reversed_digits = map(int, reversed(num_str))
    for i, digit in enumerate(reversed_digits):
        c = d_table[c][p_table[(i + 1) % 8][digit]]
    return inv_table[c]


def generate_verhoeff_number(base):
    check_digit = verhoeff_checksum(base)
    return base + str(check_digit)


def validate_verhoeff(num_str):
    return verhoeff_checksum(num_str) == 0