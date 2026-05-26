import json
import math
import sys
import time

# ==========================================
# CONFIGURACIÓN MOTO
# ==========================================
PESO_MAXIMO = 20
VOLUMEN_MAXIMO = 0.5
VELOCIDAD = 60
# Origen fijo de la Moto (taller/base en Bogotá)
ORIGEN_LAT = 4.6097
ORIGEN_LON = -74.0817
CIUDAD_MOTO = "Bogotá"  # Ciudad donde opera la moto

PRIORIDAD_PUNTAJE = {
    "URGENTE": 100,
    "ALTA": 50,
    "MEDIA": 20,
    "BAJA": 10
}

def distancia(lat1, lon1, lat2, lon2):
    return math.sqrt((lat2 - lat1)**2 + (lon2 - lon1)**2) * 111

# GREEDY FILTRO
def greedy_filtro(clientes, top_n=15):
    ordenados = sorted(clientes, key=lambda c: (
        -PRIORIDAD_PUNTAJE.get(c['Prioridad'], 0),
        c['Peso_kg']
    ))
    return ordenados[:min(top_n, len(ordenados))]

# BACKTRACKING HÍBRIDO
def backtracking_hibrido(clientes_filtrados):
    mejor_ruta = []
    mejor_puntaje = -1
    mejor_peso = 0
    mejor_volumen = 0
    
    pasos = []
    contador_nodos = 0
    contador_backtracks = 0
    mejoras_encontradas = []
    
    def registrar_paso(nivel, indice, peso_act, vol_act, seleccionados, puntaje_act, 
                       tipo="exploracion", info_adicional=None):
        pasos.append({
            "nivel": nivel,
            "indice": indice,
            "peso_actual": round(peso_act, 2),
            "volumen_actual": round(vol_act, 2),
            "puntaje_actual": puntaje_act,
            "paquetes_seleccionados": [c['ID'] for c in seleccionados],
            "nombres_seleccionados": [c['Nombre_Cliente'] for c in seleccionados],
            "tipo": tipo,
            "info": info_adicional
        })
    
    def backtracking(nivel, indice, peso_act, vol_act, seleccionados, puntaje_act):
        nonlocal mejor_ruta, mejor_puntaje, mejor_peso, mejor_volumen
        nonlocal contador_nodos, contador_backtracks
        
        contador_nodos += 1
        registrar_paso(nivel, indice, peso_act, vol_act, seleccionados, puntaje_act, "exploracion")
        
        if puntaje_act > mejor_puntaje:
            mejor_puntaje = puntaje_act
            mejor_ruta = seleccionados.copy()
            mejor_peso = peso_act
            mejor_volumen = vol_act
            mejoras_encontradas.append({
                "nivel": nivel,
                "puntaje": puntaje_act,
                "paquetes": [c['ID'] for c in seleccionados],
                "peso": peso_act,
                "volumen": vol_act
            })
            registrar_paso(nivel, indice, peso_act, vol_act, seleccionados, puntaje_act, 
                          "mejora", {"nueva_mejor_puntaje": puntaje_act})
        
        # Poda por cota superior
        puntaje_max_posible = puntaje_act
        for i in range(indice, len(clientes_filtrados)):
            puntaje_max_posible += PRIORIDAD_PUNTAJE.get(clientes_filtrados[i]['Prioridad'], 0)
        
        if puntaje_max_posible <= mejor_puntaje:
            registrar_paso(nivel, indice, peso_act, vol_act, seleccionados, puntaje_act,
                          "poda", {"razon": "No puede superar mejor puntaje", "max_posible": puntaje_max_posible})
            return
        
        for i in range(indice, len(clientes_filtrados)):
            cliente = clientes_filtrados[i]
            nuevo_peso = peso_act + cliente['Peso_kg']
            nuevo_volumen = vol_act + cliente['Volumen_m3']
            
            if nuevo_peso <= PESO_MAXIMO and nuevo_volumen <= VOLUMEN_MAXIMO:
                seleccionados.append(cliente)
                backtracking(nivel + 1, i + 1, nuevo_peso, nuevo_volumen, seleccionados,
                           puntaje_act + PRIORIDAD_PUNTAJE[cliente['Prioridad']])
                seleccionados.pop()
            else:
                contador_backtracks += 1
                registrar_paso(nivel, i, peso_act, vol_act, seleccionados, puntaje_act,
                              "backtrack", {
                                  "cliente_rechazado": cliente['ID'],
                                  "nombre_rechazado": cliente['Nombre_Cliente'],
                                  "peso_intentado": round(nuevo_peso, 2),
                                  "volumen_intentado": round(nuevo_volumen, 2),
                                  "razon": "peso" if nuevo_peso > PESO_MAXIMO else "volumen"
                              })
    
    inicio_tiempo = time.time()
    backtracking(0, 0, 0, 0, [], 0)
    tiempo_ejecucion = time.time() - inicio_tiempo
    
    return {
        "ruta": mejor_ruta,
        "puntaje": mejor_puntaje,
        "peso": mejor_peso,
        "volumen": mejor_volumen,
        "visualizacion": {
            "pasos": pasos,
            "total_nodos_explorados": contador_nodos,
            "total_backtracks": contador_backtracks,
            "total_mejoras": len(mejoras_encontradas),
            "tiempo_ejecucion_seg": round(tiempo_ejecucion, 4),
            "mejores_soluciones": mejoras_encontradas,
            "capacidad_peso_max": PESO_MAXIMO,
            "capacidad_volumen_max": VOLUMEN_MAXIMO
        }
    }

# VECINO CERCANO (optimización de ruta)
def vecino_cercano(clientes_ruta):
    if not clientes_ruta:
        return [], 0, 0
    
    ruta_optima = []
    restantes = clientes_ruta.copy()
    
    # La moto parte desde su origen FIJO (taller en Bogotá)
    lat_actual = ORIGEN_LAT
    lon_actual = ORIGEN_LON
    distancia_total = 0
    
    print(f"📍 Moto parte desde: {CIUDAD_MOTO} ({lat_actual}, {lon_actual})", file=sys.stderr)
    
    while restantes:
        mas_cercano = min(restantes, key=lambda c: distancia(lat_actual, lon_actual,
                                                              c['Latitud_Destino'], c['Longitud_Destino']))
        dist = distancia(lat_actual, lon_actual, mas_cercano['Latitud_Destino'], mas_cercano['Longitud_Destino'])
        distancia_total += dist
        ruta_optima.append(mas_cercano)
        lat_actual = mas_cercano['Latitud_Destino']
        lon_actual = mas_cercano['Longitud_Destino']
        restantes.remove(mas_cercano)
    
    return ruta_optima, distancia_total, distancia_total / VELOCIDAD

# ALGORITMO PRINCIPAL
def ejecutar_moto(clientes, top_n=15):
    if not clientes:
        return {
            "vehiculo": "Moto",
            "ciudad_operacion": CIUDAD_MOTO,
            "tipo_entrega": "local",
            "paquetes_entregados": 0,
            "peso_total": 0,
            "volumen_total": 0,
            "distancia_total": 0,
            "tiempo_total": 0,
            "ruta": [],
            "backtracking_info": None
        }
    
    # FILTRO: Moto solo entrega en CIUDAD_MOTO (Bogotá), No importa el origen del paquete, solo importa el destino
    clientes_filtrados_ciudad = [c for c in clientes if c['Ciudad_Destino'] == CIUDAD_MOTO]
    
    if not clientes_filtrados_ciudad:
        # Si no hay entregas en Bogotá, no se puede usar la moto
        return {
            "vehiculo": "Moto",
            "ciudad_operacion": CIUDAD_MOTO,
            "tipo_entrega": "local",
            "error": f"No hay paquetes para entregar en {CIUDAD_MOTO}",
            "paquetes_entregados": 0,
            "peso_total": 0,
            "volumen_total": 0,
            "distancia_total": 0,
            "tiempo_total": 0,
            "ruta": [],
            "backtracking_info": None
        }
    
    # Mostrar información de depuración
    print(f"📍 Moto operando en: {CIUDAD_MOTO}", file=sys.stderr)
    print(f"📦 Paquetes a entregar en {CIUDAD_MOTO}: {len(clientes_filtrados_ciudad)}", file=sys.stderr)
    
    # Mostrar de dónde vienen los paquetes (solo informativo)
    origenes = set([c['Ciudad_Origen'] for c in clientes_filtrados_ciudad])
    print(f"   📦 Paquetes provenientes de: {origenes}", file=sys.stderr)
    
    # Paso 1: Filtrar mejores candidatos (Greedy)
    clientes_filtrados = greedy_filtro(clientes_filtrados_ciudad, top_n)
    
    # Paso 2: Backtracking híbrido para selección óptima
    resultado_bt = backtracking_hibrido(clientes_filtrados)
    seleccionados = resultado_bt["ruta"]
    
    # Paso 3: Vecino cercano para optimizar ruta (desde el origen fijo)
    ruta_final, distancia_total, tiempo_total = vecino_cercano(seleccionados)
    
    # Construir detalle de ruta
    detalle_ruta = []
    for i, cliente in enumerate(ruta_final):
        detalle_ruta.append({
            "orden": i + 1,
            "id": cliente['ID'],
            "nombre": cliente['Nombre_Cliente'],
            "ciudad_origen": cliente['Ciudad_Origen'],
            "ciudad": cliente['Ciudad_Destino'],
            "latitud": cliente['Latitud_Destino'],
            "longitud": cliente['Longitud_Destino'],
            "peso": cliente['Peso_kg'],
            "volumen": cliente['Volumen_m3'],
            "prioridad": cliente['Prioridad']
        })
    
    return {
        "vehiculo": "Moto",
        "ciudad_operacion": CIUDAD_MOTO,
        "tipo_entrega": "local",
        "capacidad_peso_max": PESO_MAXIMO,
        "capacidad_volumen_max": VOLUMEN_MAXIMO,
        "velocidad": VELOCIDAD,
        "origen_lat": ORIGEN_LAT,
        "origen_lon": ORIGEN_LON,
        "peso_total": round(resultado_bt["peso"], 2),
        "volumen_total": round(resultado_bt["volumen"], 2),
        "distancia_total": round(distancia_total, 2),
        "tiempo_total": round(tiempo_total, 2),
        "puntaje_prioridad": resultado_bt["puntaje"],
        "paquetes_entregados": len(ruta_final),
        "ruta": detalle_ruta,
        "backtracking_info": resultado_bt["visualizacion"]
    }

# ==========================================
# EJECUCIÓN
# ==========================================
if __name__ == "__main__":
    input_file = sys.argv[1]
    
    with open(input_file, 'r', encoding='utf-8') as f:
        clientes = json.load(f)
    
    resultado = ejecutar_moto(clientes, top_n=15)
    print(json.dumps(resultado, indent=2, ensure_ascii=False))