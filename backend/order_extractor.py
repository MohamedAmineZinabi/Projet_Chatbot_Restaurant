import re
from typing import Dict, Optional, List

def extract_list_from_text(text, options):
    found = []
    for opt in options:
        if re.search(rf"\b{re.escape(opt)}\b", text):
            found.append(opt)
    return found

def extract_order_info(text: str) -> Dict[str, Optional[str | int | List[str] | bool]]:
    text = text.lower()

    plats = ["tacos", "sandwich"]
    viandes = ["thon", "poulet", "viande hachée", "viande hachee"]
    sauces = ["mayonnaise", "ketchup", "algerienne", "biggy"]
    legumes = ["tomate", "oignon", "carotte", "lettuce", "laitue"]
    tailles = ["petit", "moyen", "grand", "normal"]

    # Détection taille+plat (ex: 'petit sandwich', 'grand tacos')
    # (SUPPRIMÉ)
    plat = next((p for p in plats if p in text), None)
    taille = next((t for t in tailles if t in text), None)

    viande = next((v for v in viandes if v in text), None)
    sauces_selection = extract_list_from_text(text, sauces)
    legumes_selection = extract_list_from_text(text, legumes)

    # Amélioration pour la table (accepte 'table 7', 'table numéro 7', 'table numéro7', 'table:7', etc.)
    table = None
    match_table = re.search(r"table\s*(numéro|numero)?\s*:?\s*(\d+)", text)
    if match_table:
        try:
            table = int(match_table.group(2))
        except:
            pass
    # Aussi accepter 'à la table 7', 'pour la table 7', etc.
    if table is None:
        match_table2 = re.search(r"(à|pour) la table\s*(\d+)", text)
        if match_table2:
            try:
                table = int(match_table2.group(2))
            except:
                pass

    confirmation = any(kw in text for kw in [
        "je confirme", "je valide", "je prends", "valider", "c’est bon", "ok", "parfait"
    ])

    return {
        "plat": plat,
        "viande": viande,
        "sauces": sauces_selection,
        "legumes": legumes_selection,
        "taille": taille,
        "table": table,
        "confirmation": confirmation
    }