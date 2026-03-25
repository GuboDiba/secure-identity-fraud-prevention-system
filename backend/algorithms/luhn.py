def luhn_checksum(num_str):
    digits = [int(d) for d in num_str]
    total = 0
    reverse_digits = digits[::-1]

    for i, d in enumerate(reverse_digits):
        if i % 2 == 1:
            d *= 2
            if d > 9:
                d -= 9
        total += d

    return total % 10


def generate_luhn_number(base):
    checksum = luhn_checksum(base + "0")
    check_digit = (10 - checksum) % 10
    return base + str(check_digit)


def validate_luhn(num_str):
    return luhn_checksum(num_str) == 0