# Compute the ackermann function using recursion

import time
import sys

sys.setrecursionlimit(5000) # for cpython

m = 3
n = 9

def ack(m, n):
    if m == 0:
        return n+1
    elif m > 0 and n == 0:
        return ack(m-1, 1)
    else:
        return ack(m-1, ack(m, n-1))

result = ack(3, 7) - 1021 # dry run

bench_time = time.time()
result = result + ack(m, n)
bench_time = time.time() - bench_time
print(str(bench_time) + ' seconds: ack(' + str(m) + ', ' + str(n) + ') = ' + str(result))
