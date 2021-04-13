# micro_global_write4.py
# Auto-generated

import time

bench_iterations = 2000000
bench_duplications = 10

def bench_exec():
    global g1,g2,g3,g4;x=0
    bench_counter = bench_iterations
    while bench_counter > 0:
        bench_counter -= 1
        g1=0;g2=0;g3=0;g4=0
        g1=x;g2=x;g3=x;g4=x
        g1=x;g2=x;g3=x;g4=x
        g1=x;g2=x;g3=x;g4=x
        g1=x;g2=x;g3=x;g4=x
        g1=x;g2=x;g3=x;g4=x
        g1=x;g2=x;g3=x;g4=x
        g1=x;g2=x;g3=x;g4=x
        g1=x;g2=x;g3=x;g4=x
        g1=x;g2=x;g3=x;g4=x
        g1=x;g2=x;g3=x;g4=x
    

bench_time = time.time()
bench_exec()
bench_time = time.time() - bench_time
print(str(bench_time) + ' seconds for ' + str(bench_iterations*bench_duplications) + ' executions of: ' + 'g1=x;g2=x;g3=x;g4=x')


