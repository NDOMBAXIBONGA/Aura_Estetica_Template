import os
import re
import shutil
import base64
import zipfile

# 1. Definição dos Mapeamentos de Obfuscação de Classes e IDs
CLASS_MAPPING = {
    "font-title": "_0x_c0",
    "font-body": "_0x_c1",
    "gold-gradient": "_0x_c2",
    "gold-gradient-hover": "_0x_c3",
    "gold-text-gradient": "_0x_c4",
    "sage-gradient": "_0x_c5",
    "glass-premium": "_0x_c6",
    "glass-premium-dark": "_0x_c7",
    "gold-shadow": "_0x_c8",
    "gold-border-glow": "_0x_c9",
    "step-container": "_0x_ca",
    "step-dot": "_0x_cb",
    "step-line-fill": "_0x_cc",
    "time-slot": "_0x_cd",
    "hover-lift": "_0x_ce",
    "faq-trigger": "_0x_cf",
    "faq-content": "_0x_c10",
    "input-premium": "_0x_c11",
    "booking-treatment-card": "_0x_c12",
    "booking-professional-card": "_0x_c13",
    "calendar-grid": "_0x_c14",
    "calendar-month-year": "_0x_c15",
    "btn-prev-step": "_0x_c16",
    "btn-reset-booking": "_0x_c17",
    "cta-agendar-tratamento": "_0x_c18",
    "cta-agendar-geral": "_0x_c19",
    "reveal-item": "_0x_c1a",
    "hero-parallax-bg": "_0x_c1b",
    "mobile-link": "_0x_c1c",
    "active": "_0x_c1d",
    "completed": "_0x_c1e",
    "selected": "_0x_c1f",
}

ID_MAPPING = {
    "booking-form-step3": "_0x_i0",
    "client-name": "_0x_i1",
    "client-email": "_0x_i2",
    "client-phone": "_0x_i3",
    "next-step-1": "_0x_i4",
    "next-step-2": "_0x_i5",
    "next-step-3": "_0x_i6",
    "btn-reset-booking": "_0x_i7",
    "mobile-menu-btn": "_0x_i8",
    "mobile-menu": "_0x_i9",
    "prev-month": "_0x_ia",
    "next-month": "_0x_ib",
    "summary-treatment": "_0x_ic",
    "summary-professional": "_0x_id",
    "summary-datetime": "_0x_ie",
    "summary-client": "_0x_if",
}

# Blacklist de palavras-chave JS e APIs do navegador que NÃO devem ser renomeadas
RESERVED_AND_APIS = {
    # Palavras-chave JS
    "break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do", "else", "export",
    "extends", "finally", "for", "function", "if", "import", "in", "instanceof", "new", "return", "super", "switch",
    "this", "throw", "try", "typeof", "var", "void", "while", "with", "yield", "let", "static", "enum", "await",
    "true", "false", "null", "undefined",
    
    # Objetos e APIs globais
    "window", "document", "console", "Math", "Date", "RegExp", "String", "Number", "Array", "Object", "JSON", 
    "parseInt", "parseFloat", "encodeURIComponent", "decodeURIComponent", "atob", "btoa", "setTimeout", "setInterval",
    "Error", "FormData", "XMLHttpRequest", "fetch", "Headers", "Request", "Response",
    
    # Métodos e propriedades internas do navegador/DOM
    "addEventListener", "querySelector", "querySelectorAll", "getElementById", "createElement", "appendChild",
    "getAttribute", "setAttribute", "removeAttribute", "classList", "add", "remove", "toggle", "contains",
    "style", "maxHeight", "scrollHeight", "textContent", "value", "trim", "length", "test", "replace", 
    "target", "slice", "toISOString", "split", "toDateString", "toLocaleDateString", "forEach",
    "scrollIntoView", "behavior", "disabled", "className", "type", "innerHTML", "getAttributeNames",
    "getDay", "getFullYear", "getMonth", "getDate", "setMonth", "preventDefault",
    
    # Bibliotecas externas (GSAP, Lucide)
    "gsap", "ScrollTrigger", "registerPlugin", "timeline", "delay", "to", "from", "fromTo", "opacity", "y", 
    "duration", "onComplete", "scale", "stagger", "ease", "trigger", "start", "toggleActions", "scrub", 
    "yPercent", "lucide", "createIcons", "play", "none", "scrollTrigger",
    
    # Propriedades de negócio (chaves do objeto bookingState e toLocaleDateString)
    "treatment", "professional", "date", "time", "clientName", "clientEmail", "clientPhone",
    "weekday", "day", "month", "year", "meses", "diasSemana",
    
    # Configurações Tailwind inline
    "tailwind", "config", "theme", "extend", "colors", "sand", "DEFAULT", "dark", "champagne", "goldrose", "sage", "light", "muted"
}

def replace_selectors(content, class_map, id_map):
    # Substituir IDs
    sorted_ids = sorted(id_map.keys(), key=len, reverse=True)
    for key in sorted_ids:
        val = id_map[key]
        content = re.sub(rf'\b{key}\b', val, content)
        
    # Substituir Classes
    sorted_classes = sorted(class_map.keys(), key=len, reverse=True)
    for key in sorted_classes:
        val = class_map[key]
        content = re.sub(rf'\b{key}\b', val, content)
        
    return content

def minify_css(css_code):
    # Remover comentários /* ... */
    css_code = re.sub(r'/\*[\s\S]*?\*/', '', css_code)
    # Colapsar espaços
    css_code = re.sub(r'\s+', ' ', css_code)
    # Remover espaços ao redor de chaves e pontuações
    css_code = re.sub(r'\s*([\{\}:;,])\s*', r'\1', css_code)
    return css_code.strip()

def obfuscate_js(js_code):
    # 1. Remover comentários e extrair strings FIRST (para não confundir strings com identificadores de variáveis)
    pattern = re.compile(
        r'(?P<comment_multi>/\*[\s\S]*?\*/)'
        r'|(?P<comment_single>//.*?$)'
        r'|(?P<string_double>"(?:[^"\\]|\\.)*")'
        r'|(?P<string_single>\'(?:[^\'\\]|\\.)*\')'
        , re.MULTILINE
    )

    strings = []
    
    def replacer(match):
        gd = match.groupdict()
        if gd['comment_multi'] or gd['comment_single']:
            return ' ' # Remove comentário
        elif gd['string_double']:
            s = match.group('string_double')
            val = s[1:-1]
            if val not in strings:
                strings.append(val)
            idx = strings.index(val)
            return f"_0x_str({idx})"
        elif gd['string_single']:
            s = match.group('string_single')
            val = s[1:-1]
            if val not in strings:
                strings.append(val)
            idx = strings.index(val)
            return f"_0x_str({idx})"
        return match.group(0)

    # js_code_no_str contém apenas _0x_str(index) no lugar das strings originais
    js_code_no_str = pattern.sub(replacer, js_code)

    # 2. Identificar e extrair dinamicamente todas as variáveis/funções customizadas da estrutura do código
    all_idents = re.findall(r'\b[a-zA-Z_$][a-zA-Z0-9_$]*\b', js_code_no_str)
    custom_vars = set()
    for ident in all_idents:
        if ident in RESERVED_AND_APIS:
            continue
        if ident.startswith("_0x_"):
            continue
        custom_vars.add(ident)
        
    sorted_vars = sorted(list(custom_vars), key=len, reverse=True)
    
    print(f"Identificadas {len(sorted_vars)} variáveis e funções customizadas para obfuscação:")
    print(", ".join(sorted_vars))

    # 3. Renomear variáveis internas do JS no código sem strings
    for i, var_name in enumerate(sorted_vars):
        obf_var = f"_0x_v{i:x}"
        js_code_no_str = re.sub(rf'\b{var_name}\b', obf_var, js_code_no_str)
    
    # 4. Base64-encode strings table e injetar runtime lookup helper
    b64_table = []
    for s in strings:
        # Codifica cada string em base64
        b64_val = base64.b64encode(s.encode('utf-8')).decode('utf-8')
        b64_table.append(b64_val)
        
    b64_table_js = "[" + ",".join(f'"{x}"' for x in b64_table) + "]"
    
    helper = (
        f"const _0x_tbl = {b64_table_js};\n"
        f"function _0x_str(i) {{ return atob(_0x_tbl[i]); }}\n"
    )
    
    final_js = helper + js_code_no_str
    
    # 5. Minificação básica de linhas e espaços
    lines = final_js.split('\n')
    clean_lines = []
    for line in lines:
        line_stripped = line.strip()
        if line_stripped:
            clean_lines.append(line_stripped)
            
    return "\n".join(clean_lines)

def build_production():
    src_dir = "./src"
    root_dir = "."
    
    # 1. Se a pasta src/ não existir, faz o backup dos arquivos limpos atuais para lá
    if not os.path.exists(src_dir):
        print("Criando pasta 'src/' para armazenar o código de desenvolvimento limpo...")
        os.makedirs(src_dir)
        
        # Mover index.html, style.css, script.js para src/ se existirem na raiz
        for filename in ["index.html", "style.css", "script.js"]:
            if os.path.exists(filename):
                shutil.copy2(filename, os.path.join(src_dir, filename))
                print(f"Copiado {filename} limpo para {src_dir}/{filename}")

    # 2. Leitura dos arquivos fonte limpos de src/
    with open(os.path.join(src_dir, "index.html"), "r", encoding="utf-8") as f:
        html = f.read()
    with open(os.path.join(src_dir, "style.css"), "r", encoding="utf-8") as f:
        css = f.read()
    with open(os.path.join(src_dir, "script.js"), "r", encoding="utf-8") as f:
        js = f.read()

    # 3. Aplicar mapeamento de classes, minificação de CSS e obfuscação de JS
    print("Aplicando mapeamento de classes e IDs...")
    html_obf = replace_selectors(html, CLASS_MAPPING, ID_MAPPING)
    css_obf = replace_selectors(css, CLASS_MAPPING, ID_MAPPING)
    js_obf = replace_selectors(js, CLASS_MAPPING, ID_MAPPING)
    
    print("Minificando CSS...")
    css_final = minify_css(css_obf)
    
    print("Obfuscando e minificando JavaScript...")
    js_final = obfuscate_js(js_obf)
    
    print("Limpando e minificando HTML...")
    html_final = re.sub(r'<!--[\s\S]*?-->', '', html_obf)
    html_lines = html_final.split('\n')
    html_final = "\n".join([line.strip() for line in html_lines if line.strip()])

    # 4. Gravar os arquivos obfuscados DIRETAMENTE NA RAIZ (sobrescrevendo os arquivos legíveis)
    print("Escrevendo arquivos obfuscados na raiz...")
    with open(os.path.join(root_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(html_final)
    with open(os.path.join(root_dir, "style.css"), "w", encoding="utf-8") as f:
        f.write(css_final)
    with open(os.path.join(root_dir, "script.js"), "w", encoding="utf-8") as f:
        f.write(js_final)

    # 5. Gerar o ZIP de distribuição excluindo src/ e o script de build
    zip_filename = "main-download.zip" # Vamos sobrescrever o zip principal!
    print(f"Empacotando arquivos de produção no {zip_filename} (excluindo código fonte e scripts)...")
    
    files_to_zip = [
        "index.html",
        "style.css",
        "script.js",
        "readme.txt",
        "icon.png",
        "preview.png",
        "descricao_codester.txt"
    ]
    folders_to_zip = [
        "assets",
        "documentation",
        "screenshots"
    ]
    
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Adicionar arquivos individuais
        for file in files_to_zip:
            if os.path.exists(file):
                zipf.write(file, file)
                
        # Adicionar pastas recursivamente
        for folder in folders_to_zip:
            if os.path.exists(folder):
                for root, dirs, files in os.walk(folder):
                    for file in files:
                        abs_path = os.path.join(root, file)
                        rel_path = os.path.relpath(abs_path, ".")
                        zipf.write(abs_path, rel_path)
                        
    print("Processo concluído com sucesso!")
    print("Códigos na raiz estão agora 100% obfuscados.")
    print("Códigos de desenvolvimento limpos estão salvos em './src/'")
    print(f"Pacote de venda atualizado: {os.path.abspath(zip_filename)}")

if __name__ == "__main__":
    build_production()
