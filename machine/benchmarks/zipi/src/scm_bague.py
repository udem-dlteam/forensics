#*=====================================================================*/
#*    serrano/prgm/project/zipi/bench/scm_bague.py                     */
#*    -------------------------------------------------------------    */
#*    Author      :  Pierre Weis                                       */
#*    Creation    :  Fri Apr  1 10:00:21 1994                          */
#*    Last change :  Fri Dec 11 09:02:51 2020 (serrano)                */
#*    -------------------------------------------------------------    */
#*    Resolution recursive du Baguenaudier: bench les appels de        */
#*    fonctions et les acces aux vecteurs                              */
#*    avec 21 pierres le nombre de coups est 1398101                   */
#*    avec 24 pierres le nombre de coups est 11184810                  */
#*    f (n+1) = 2*f(n) + n mod 2 avec f 1 = 1                          */
#*=====================================================================*/
import time

nombre_de_coups = 0
jeu = []

une_pierre = 1
une_case_vide = 0

def init_jeu( nombre_de_pierres ):
    global nombre_de_coups
    global jeu

    nombre_de_coups = 0
    jeu = [ 0 ] * nombre_de_pierres

    for i in range( nombre_de_pierres ):
        jeu[ i ] = une_pierre

def la_case( n ):
    return n - 1;

def enleve_la_pierre( n ):
    if jeu[ la_case( n ) ] == une_pierre:
        jeu[ la_case( n ) ] = une_case_vide

def pose_la_pierre( n ):
    if jeu[ la_case( n ) ] == une_case_vide:
        jeu[ la_case( n ) ] = une_pierre

def autorise_mouvement( n ):
    if n == 1:
        return True
    elif n == 2:
        return jeu[ la_case( 1 ) ] == une_pierre
    else:
        if jeu[ la_case( n - 1 ) ] != une_pierre:
            return False

        b = True

        for i in range( la_case( n - 2 ) + 1 ):
            b = b and (jeu[ i ] == une_case_vide)

        return b

def enleve_pierre( n ):
    global nombre_de_coups
    
    nombre_de_coups = nombre_de_coups + 1

    if autorise_mouvement( n ):
        enleve_la_pierre( n )

def pose_pierre( n ):        
    global nombre_de_coups
    
    nombre_de_coups = nombre_de_coups + 1

    if autorise_mouvement( n ):
        pose_la_pierre( n )

def run( nombre_de_pierres ):

    def bague( n ):
        if n == 1:
            enleve_pierre( 1 )
            return
        elif n == 2:
            enleve_pierre( 2 )
            enleve_pierre( 1 )
            return
        else:
            bague( n - 2 )
            enleve_pierre( n )
            repose( n - 2 )
            bague( n - 1 )


    def repose( n ):
        if n == 1:
            pose_pierre( 1 )
            return
        elif n == 2:
            pose_pierre( 1 )
            pose_pierre( 2 )
            return
        else:
            repose( n - 1 )
            bague( n - 2 )
            pose_pierre( n )
            repose( n - 2 )

    init_jeu( nombre_de_pierres )
    bague( nombre_de_pierres )

    res = 0;

    if nombre_de_pierres == 1:
        res = 1
    elif nombre_de_pierres == 2:
        res = 2
    elif nombre_de_pierres == 10:
        res = 682
    elif nombre_de_pierres == 14:
        res = 10922
    elif nombre_de_pierres == 20:
        res = 699050
    elif nombre_de_pierres == 24:
        res = 11184810
    elif nombre_de_pierres == 25:
        res = 22369621
    elif nombre_de_pierres == 26:
        res = 44739242
    elif nombre_de_pierres == 27:
        res = 89478485
    elif nombre_de_pierres == 28:
        res = 178956970

    return "res=" + str( res ) + " nb-coups=" + str( nombre_de_coups )

def main( bench, n, arg ):
    res = 0
    k = n // 10
    i = 1

    print( bench, "(", n, ")..." )

    for n in range( n ):
        if (n % k) == 0:
            print( i )
            i = i + 1
        run( arg )

def bench_exec( name, N, arg ):
    bench_time = time.time()
    main( name, N, arg )
    bench_time = time.time() - bench_time
    print( bench_time, 'seconds for', N, 'executions of:', name )
    
bench_exec( "scm_bague", 10, 20 )
