# micro_call_ord_str.py
# Auto-generated

import time

bench_iterations = 1300000
bench_duplications = 30

def bench_exec():
    s="x"
    bench_counter = bench_iterations
    while bench_counter > 0:
        bench_counter -= 1
        
        ord(s)
        ord(s)
        ord(s)
        ord(s)
        ord(s)
        ord(s)
        ord(s)
        ord(s)
        ord(s)
        ord(s)
        ord(s)
        ord(s)
        ord(s)
        ord(s)
        ord(s)
        ord(s)
        ord(s)
        ord(s)
        ord(s)
        ord(s)
        ord(s)
        ord(s)
        ord(s)
        ord(s)
        ord(s)
        ord(s)
        ord(s)
        ord(s)
        ord(s)
        ord(s)
    

bench_time = time.time()
bench_exec()
bench_time = time.time() - bench_time
print(str(bench_time) + ' seconds for ' + str(bench_iterations*bench_duplications) + ' executions of: ' + 'ord(s)')


