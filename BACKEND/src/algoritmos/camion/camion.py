import json
import math
import sys

# ==========================================
# CONFIGURACIÓN CAMIÓN (CAPACIDADES REALES)
# ==========================================
PESO_MAXIMO = 150     # kg
VOLUMEN_MAXIMO = 5  # m³
VELOCIDAD = 80         # km/h
ORIGEN_LAT = 4.6097
ORIGEN_LON = -74.0817

# PUNTAJE DE PRIORIDAD
PRIORIDAD_PUNTAJE = {
    "URGENTE": 100,
    "ALTA": 50,
    "MEDIA": 20,
    "BAJA": 10
}

# DISTANCIA
def distancia(lat1, lon1, lat2, lon2):
    return math.sqrt((lat2 - lat1)**2 + (lon2 - lon1)**2) * 111

# GREEDY SELECTION
def greedy_seleccion(clientes):
    # ⬇️ CAMBIADO: usa 'Prioridad' con P mayúscula
    ordenados = sorted(clientes, key=lambda c: (
        -PRIORIDAD_PUNTAJE.get(c['Prioridad'], 0),
        c['Peso_kg']  # ⬅️ CAMBIADO: usa Peso_kg
    ))
    
    seleccionados = []
    peso_total = 0
    volumen_total = 0
    
    for cliente in ordenados:
        # ⬇️ CAMBIADO: usa Peso_kg y Volumen_m3
        if peso_total + cliente['Peso_kg'] <= PESO_MAXIMO and volumen_total + cliente['Volumen_m3'] <= VOLUMEN_MAXIMO:
            seleccionados.append(cliente)
            peso_total += cliente['Peso_kg']
            volumen_total += cliente['Volumen_m3']
    
    puntaje = sum(PRIORIDAD_PUNTAJE.get(c['Prioridad'], 0) for c in seleccionados)
    
    return seleccionados, peso_total, volumen_total, puntaje

# VECINO MÁS CERCANO
def vecino_cercano(clientes_ruta):
    if not clientes_ruta:
        return [], 0, 0
    
    ruta_optima = []
    restantes = clientes_ruta.copy()
    
    lat_actual = ORIGEN_LAT
    lon_actual = ORIGEN_LON
    
    distancia_total = 0
    
    while restantes:
        # usa Latitud_Destino y Longitud_Destino
        mas_cercano = min(restantes, key=lambda c: distancia(
            lat_actual, lon_actual, 
            c['Latitud_Destino'], c['Longitud_Destino']
        ))
        
        dist = distancia(lat_actual, lon_actual, 
                        mas_cercano['Latitud_Destino'], mas_cercano['Longitud_Destino'])
        distancia_total += dist
        
        ruta_optima.append(mas_cercano)
        lat_actual = mas_cercano['Latitud_Destino']
        lon_actual = mas_cercano['Longitud_Destino']
        restantes.remove(mas_cercano)
    
    tiempo_total = distancia_total / VELOCIDAD
    
    return ruta_optima, distancia_total, tiempo_total

# ALGORITMO PRINCIPAL
def ejecutar_camion(clientes):
    seleccionados, peso_total, volumen_total, puntaje = greedy_seleccion(clientes)
    ruta_final, distancia_total, tiempo_total = vecino_cercano(seleccionados)
    
    # Construir detalle de ruta
    detalle_ruta = []
    for i, cliente in enumerate(ruta_final):
        detalle_ruta.append({
            "orden": i + 1,
            "id": cliente['ID'],
            "nombre": cliente['Nombre_Cliente'],
            "ciudad": cliente['Ciudad_Destino'],
            "latitud": cliente['Latitud_Destino'],
            "longitud": cliente['Longitud_Destino'],
            "peso": cliente['Peso_kg'],
            "volumen": cliente['Volumen_m3'],
            "prioridad": cliente['Prioridad']
        })
    
    return {
        "vehiculo": "Camion",
        "capacidad_peso_max": PESO_MAXIMO,
        "capacidad_volumen_max": VOLUMEN_MAXIMO,
        "velocidad": VELOCIDAD,
        "peso_total": round(peso_total, 2),
        "volumen_total": round(volumen_total, 2),
        "distancia_total": round(distancia_total, 2),
        "tiempo_total": round(tiempo_total, 2),
        "puntaje_prioridad": puntaje,
        "paquetes_entregados": len(ruta_final),
        "ruta": detalle_ruta
    }

# EJECUCIÓN DESDE NODE.JS
if __name__ == "__main__":
    input_file = sys.argv[1]
    
    with open(input_file, 'r', encoding='utf-8') as f:
        clientes = json.load(f)
    
    resultado = ejecutar_camion(clientes)
    print(json.dumps(resultado, indent=2, ensure_ascii=False))