import json
import math
import sys

# CONFIGURACIÓN
PESO_MAXIMO = 500
VOLUMEN_MAXIMO = 15
VELOCIDAD = 50
CIUDAD_BASE = "Bogotá"
ORIGEN_LAT = 4.6097
ORIGEN_LON = -74.0817

def distancia(lat1, lon1, lat2, lon2):
    return math.sqrt((lat2 - lat1)**2 + (lon2 - lon1)**2) * 111

# QUICKSORT
def quicksort(clientes):
    if len(clientes) <= 1:
        return clientes
    pivote = clientes[len(clientes)//2]
    dist_pivote = distancia(ORIGEN_LAT, ORIGEN_LON, pivote['Latitud_Destino'], pivote['Longitud_Destino'])
    menores = [c for c in clientes if distancia(ORIGEN_LAT, ORIGEN_LON, c['Latitud_Destino'], c['Longitud_Destino']) < dist_pivote]
    iguales = [c for c in clientes if distancia(ORIGEN_LAT, ORIGEN_LON, c['Latitud_Destino'], c['Longitud_Destino']) == dist_pivote]
    mayores = [c for c in clientes if distancia(ORIGEN_LAT, ORIGEN_LON, c['Latitud_Destino'], c['Longitud_Destino']) > dist_pivote]
    return quicksort(menores) + iguales + quicksort(mayores)

# KNAPSACK 2D LIGERO (respeta peso Y volumen)
def knapsack_2d(clientes):
    if not clientes:
        return []
    
    # Filtrar paquetes que no caben individualmente
    validos = [c for c in clientes if c['Peso_kg'] <= PESO_MAXIMO and c['Volumen_m3'] <= VOLUMEN_MAXIMO]
    if not validos:
        return []
    
    # Redondear volumenes para simplificar (multiplicar por 10 para trabajar con enteros)
    # Esto hace que la matriz sea más pequeña: 501 x 151 (si volumen es 15, multiplicado por 10 = 150)
    ESCALA = 10
    volumen_max_escala = int(VOLUMEN_MAXIMO * ESCALA)
    
    # dp[peso][volumen] = peso alcanzado (usamos -1 para no alcanzado)
    dp = [[-1] * (volumen_max_escala + 1) for _ in range(PESO_MAXIMO + 1)]
    dp[0][0] = 0
    seleccion = [[None] * (volumen_max_escala + 1) for _ in range(PESO_MAXIMO + 1)]
    seleccion[0][0] = []
    
    for cliente in validos:
        peso = int(cliente['Peso_kg'])
        volumen = int(cliente['Volumen_m3'] * ESCALA)
        
        for p in range(PESO_MAXIMO, peso - 1, -1):
            for v in range(volumen_max_escala, volumen - 1, -1):
                if dp[p - peso][v - volumen] != -1:
                    nuevo_peso = dp[p - peso][v - volumen] + peso
                    if nuevo_peso > dp[p][v]:
                        dp[p][v] = nuevo_peso
                        seleccion[p][v] = seleccion[p - peso][v - volumen] + [cliente]
    
    # Encontrar la mejor combinación (máximo peso)
    mejor = []
    mejor_peso = 0
    for p in range(PESO_MAXIMO, -1, -1):
        for v in range(volumen_max_escala, -1, -1):
            if dp[p][v] != -1 and dp[p][v] > mejor_peso:
                mejor_peso = dp[p][v]
                mejor = seleccion[p][v]
                break
        if mejor:
            break
    
    return mejor

# KRUSKAL
def kruskal(clientes):
    n = len(clientes)
    if n < 2:
        return clientes, 0
    
    aristas = []
    for i in range(n):
        for j in range(i+1, n):
            d = distancia(clientes[i]['Latitud_Destino'], clientes[i]['Longitud_Destino'],
                         clientes[j]['Latitud_Destino'], clientes[j]['Longitud_Destino'])
            aristas.append((d, i, j))
    aristas.sort(key=lambda x: x[0])
    
    padre = list(range(n))
    def find(x):
        while padre[x] != x:
            padre[x] = padre[padre[x]]
            x = padre[x]
        return x
    
    mst = []
    dist_total = 0
    for d, i, j in aristas:
        ri, rj = find(i), find(j)
        if ri != rj:
            padre[ri] = rj
            mst.append((i, j))
            dist_total += d
            if len(mst) == n-1:
                break
    
    grafo = [[] for _ in range(n)]
    for i, j in mst:
        grafo[i].append(j)
        grafo[j].append(i)
    
    ruta = []
    visitado = [False] * n
    def dfs(u):
        visitado[u] = True
        ruta.append(clientes[u])
        for v in grafo[u]:
            if not visitado[v]:
                dfs(v)
    dfs(0)
    
    return ruta, dist_total

# PRINCIPAL
def ejecutar_algoritmo(clientes):
    # Filtrar entregas fuera de Bogotá
    paquetes = [c for c in clientes if c['Ciudad_Destino'] != CIUDAD_BASE]
    
    if not paquetes:
        return {"vehiculo": "Mula", "error": f"No hay entregas fuera de {CIUDAD_BASE}", "paquetes_entregados": 0}
    
    # 1. QuickSort
    ordenados = quicksort(paquetes)
    # 2. Knapsack 2D ligero
    seleccionados = knapsack_2d(ordenados)
    
    if not seleccionados:
        return {"vehiculo": "Mula", "paquetes_entregados": 0}
    
    # Verificar límites
    peso_total = sum(c['Peso_kg'] for c in seleccionados)
    volumen_total = sum(c['Volumen_m3'] for c in seleccionados)
    
    # Si aún así excede, forzar corrección
    if peso_total > PESO_MAXIMO or volumen_total > VOLUMEN_MAXIMO:
        print(f"⚠️ Corrigiendo exceso: peso={peso_total}kg vol={volumen_total}m³", file=sys.stderr)
        # Usar greedy como respaldo
        from collections import defaultdict
        prioridad_valor = {"URGENTE": 100, "ALTA": 50, "MEDIA": 20, "BAJA": 10}
        ordenados.sort(key=lambda c: (-prioridad_valor.get(c['Prioridad'], 0), c['Peso_kg']))
        seleccionados = []
        peso_act = 0
        vol_act = 0
        for c in ordenados:
            if c['Peso_kg'] <= PESO_MAXIMO and c['Volumen_m3'] <= VOLUMEN_MAXIMO:
                if peso_act + c['Peso_kg'] <= PESO_MAXIMO and vol_act + c['Volumen_m3'] <= VOLUMEN_MAXIMO:
                    seleccionados.append(c)
                    peso_act += c['Peso_kg']
                    vol_act += c['Volumen_m3']
        peso_total = peso_act
        volumen_total = vol_act
    
    # Kruskal
    ruta, distancia_total = kruskal(seleccionados)
    tiempo_total = distancia_total / VELOCIDAD
    
    detalle = []
    for i, c in enumerate(ruta):
        detalle.append({
            "orden": i+1, "id": c['ID'], "nombre": c['Nombre_Cliente'],
            "ciudad": c['Ciudad_Destino'], "latitud": c['Latitud_Destino'],
            "longitud": c['Longitud_Destino'], "peso": c['Peso_kg'],
            "volumen": c['Volumen_m3'], "prioridad": c['Prioridad']
        })
    
    return {
        "vehiculo": "Mula",
        "ciudad_base": CIUDAD_BASE,
        "origen_lat": ORIGEN_LAT,
        "origen_lon": ORIGEN_LON,
        "capacidad_peso_max": PESO_MAXIMO,
        "capacidad_volumen_max": VOLUMEN_MAXIMO,
        "velocidad": VELOCIDAD,
        "paquetes_entregados": len(ruta),
        "peso_total": round(peso_total, 2),
        "volumen_total": round(volumen_total, 2),
        "distancia_total": round(distancia_total, 2),
        "tiempo_total": round(tiempo_total, 2),
        "ruta": detalle,
        "info_algoritmo": {
            "ordenamiento": "QuickSort (DyV)",
            "seleccion": "Knapsack 2D",
            "ruta": "Kruskal (MST)"
        }
    }

if __name__ == "__main__":
    with open(sys.argv[1], 'r', encoding='utf-8') as f:
        clientes = json.load(f)
    print(json.dumps(ejecutar_algoritmo(clientes), indent=2, ensure_ascii=False))