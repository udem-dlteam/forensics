# micro_accum_str_right_100.py
# Auto-generated

import time

bench_iterations = 100000
bench_duplications = 1

def bench_exec():
    s1="a"
    bench_counter = bench_iterations
    while bench_counter > 0:
        bench_counter -= 1
        s2="b";x=100
        while x>0:x-=1;s2=s2+s1
    

bench_time = time.time()
bench_exec()
bench_time = time.time() - bench_time
print(str(bench_time) + ' seconds for ' + str(bench_iterations*bench_duplications) + ' executions of: ' + 'while x>0:x-=1;s2=s2+s1')


