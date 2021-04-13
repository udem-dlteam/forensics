# Solve the n-queens problem using bit sets and recursion

import time

n = 12

def q(i, diag1, diag2, cols):
    if i == 0:
        return 1
    else:
        free = diag1 & diag2 & cols
        col = 1
        nsols = 0
        while col <= free:
            if col & free:
                nsols += q(i-1, ((diag1-col)<<1)+1, (diag2-col)>>1, cols-col)
            col <<= 1
        return nsols

def queens(n):
    return q(n, -1, -1, (1<<n)-1)

result = queens(8) - 92 # dry run

bench_time = time.time()
result = result + queens(n)
bench_time = time.time() - bench_time
print(str(bench_time) + ' seconds: queens(' + str(n) + ') = ' + str(result))
