# micro_var_list_index_0.py
# Auto-generated

import time

bench_iterations = 1600000
bench_duplications = 30

def bench_exec():
    lst=[0]
    bench_counter = bench_iterations
    while bench_counter > 0:
        bench_counter -= 1
        
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
        x=lst[0]
    

bench_time = time.time()
bench_exec()
bench_time = time.time() - bench_time
print(str(bench_time) + ' seconds for ' + str(bench_iterations*bench_duplications) + ' executions of: ' + 'x=lst[0]')


