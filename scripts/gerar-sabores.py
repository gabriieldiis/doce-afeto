"""Gera as páginas de cada sabor em sabor/{slug}.html.

Para mudar textos de um sabor, edite a lista SABORES abaixo e rode:
    python scripts/gerar-sabores.py
"""
from pathlib import Path
from html import escape
import json

RAIZ = Path(__file__).resolve().parent.parent
SITE = "https://doce-afeto-liard.vercel.app"

SABORES = [
    {
        "slug": "tradicional", "nome": "Tradicional", "papel": "azul",
        "chamada": "O clássico que nunca erra.",
        "pausa": "Ao leite por fora, cremosa por dentro. A companhia certa para o cafezinho depois do almoço, quando você só quer cinco minutos de calma.",
        "desc": "Casca de chocolate ao leite com recheio cremoso de chocolate.",
    },
    {
        "slug": "meio-amargo", "nome": "Meio Amargo", "papel": "marrom",
        "chamada": "Para quem gosta de chocolate com personalidade.",
        "pausa": "Menos doce, mais cacau. Combina com um café sem açúcar naquela pausa do meio da tarde em que você precisa recarregar.",
        "desc": "Casca e recheio de chocolate Meio Amargo.",
    },
    {
        "slug": "brigadeiro", "nome": "Brigadeiro", "papel": "roxo",
        "chamada": "Gosto de festa em qualquer dia comum.",
        "pausa": "Para quando a semana está pesada e você merece um mimo. Uma mordida e o dia corrido fica um pouco mais leve.",
        "desc": "Casca de chocolate ao leite com recheio cremoso de brigadeiro.",
    },
    {
        "slug": "maracuja", "nome": "Maracujá", "papel": "dourado",
        "chamada": "O azedinho que equilibra o chocolate.",
        "pausa": "Uma pausa leve e refrescante para o pós-almoço: o doce do chocolate ao leite com o toque ácido do maracujá.",
        "desc": "Casca de chocolate ao leite com recheio cremoso de maracujá.",
    },
    {
        "slug": "limao", "nome": "Limão", "papel": "verde",
        "chamada": "Fresquinha do começo ao fim.",
        "pausa": "Chocolate ao leite com o toque cítrico do limão. Perfeita para dar aquela acordada no fim da tarde.",
        "desc": "Casca de chocolate ao leite com recheio cremoso de limão.",
    },
    {
        "slug": "cereja", "nome": "Cereja", "papel": "vermelho",
        "chamada": "Doce, frutada e delicada.",
        "pausa": "Para aquela pausa rápida entre uma tarefa e outra que acaba virando o melhor momento do dia.",
        "desc": "Casca de chocolate ao leite com recheio cremoso de cereja.",
    },
    {
        "slug": "prestigio", "nome": "Prestígio", "papel": "prateado",
        "chamada": "Chocolate com coco, do jeito que a gente lembra.",
        "pausa": "Recheio cremoso de coco envolvido em chocolate ao leite. Uma pausa com gosto de lembrança boa.",
        "desc": "Casca de chocolate ao leite com recheio cremoso de coco.",
    },
]


def srcset(slug, sufixo=""):
    return ", ".join(f"../img/sabores/{slug}{sufixo}-{w}.webp {w}w" for w in (480, 800, 1200))


def outros(atual):
    itens = []
    for s in SABORES:
        if s["slug"] == atual["slug"]:
            continue
        itens.append(
            f'''          <li><a href="{s["slug"]}.html">
            <img src="../img/sabores/{s["slug"]}-480.webp" alt="" width="480" height="480" loading="lazy" decoding="async">
            <span>{escape(s["nome"])}</span>
          </a></li>''')
    return "\n".join(itens)


def pagina(s):
    nome = escape(s["nome"])
    slug = s["slug"]
    titulo = f"Trufa {s['nome']} | Doce Afeto"
    descricao = f"Trufa artesanal sabor {s['nome']}, com cerca de 45 g, feita à mão. {s['desc']} R$ 4,99 a unidade, pedido pelo WhatsApp."
    url = f"{SITE}/sabor/{slug}.html"
    imagem = f"{SITE}/img/sabores/{slug}-1200.webp"
    ld = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": f"Trufa artesanal {s['nome']}",
        "description": f"{s['desc']} Feita à mão, com cerca de 45 g.",
        "image": [imagem],
        "brand": {"@type": "Brand", "name": "Doce Afeto"},
        "weight": {"@type": "QuantitativeValue", "value": 45, "unitCode": "GRM"},
        "offers": {"@type": "Offer", "price": "4.99", "priceCurrency": "BRL",
                   "availability": "https://schema.org/InStock", "url": url},
    }
    return f'''<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{escape(titulo)}</title>
  <meta name="description" content="{escape(descricao)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#F5EFE7">
  <meta name="format-detection" content="telephone=no">
  <link rel="canonical" href="{url}">

  <meta property="og:type" content="product">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="Doce Afeto">
  <meta property="og:url" content="{url}">
  <meta property="og:title" content="{escape(titulo)}">
  <meta property="og:description" content="{escape(s['chamada'])} Trufa artesanal de 45 g a R$ 4,99.">
  <meta property="og:image" content="{imagem}">
  <meta name="twitter:card" content="summary_large_image">

  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%2335170F'/%3E%3Ctext x='32' y='45' font-family='Georgia,serif' font-style='italic' font-size='40' fill='%23D9B99A' text-anchor='middle'%3Ed%3C/text%3E%3C/svg%3E">
  <link rel="preload" href="../fonts/dm-serif-display.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../fonts/manrope.woff2" as="font" type="font/woff2" crossorigin>

  <script type="application/ld+json">
  {json.dumps(ld, ensure_ascii=False, indent=2).replace(chr(10), chr(10) + "  ")}
  </script>

  <link rel="stylesheet" href="../css/style.css">
</head>
<body data-base="../">
  <!-- Página gerada por scripts/gerar-sabores.py: edite os textos lá e rode o script de novo. -->

  <header class="topo" id="topo">
    <div class="wrap">
      <a class="logo" href="../index.html" aria-label="Doce Afeto, início"><em>doce</em>afeto</a>
      <nav aria-label="Principal">
        <a href="../index.html#sabores">Sabores</a>
        <a href="../index.html#como-pedir">Como pedir</a>
        <a class="btn" id="topo-pedido" href="../index.html#sabores">Fazer pedido</a>
      </nav>
    </div>
  </header>

  <main>
    <div class="wrap">
      <a class="voltar" href="../index.html#sabores">&#8249; Todos os sabores</a>
    </div>

    <section class="produto wrap" aria-labelledby="produto-nome">
      <div class="detalhe-galeria">
        <div class="slides" id="produto-slides" tabindex="0" aria-label="Fotos do sabor. Use as setas para trocar.">
          <img src="../img/sabores/{slug}-800.webp" srcset="{srcset(slug)}" sizes="(min-width: 960px) 560px, 100vw" alt="Trufa sabor {nome}: uma embrulhada em papel {s['papel']} e outra cortada mostrando o recheio" width="800" height="800" fetchpriority="high" decoding="async" draggable="false">
          <img src="../img/sabores/{slug}-mao-800.webp" srcset="{srcset(slug, '-mao')}" sizes="(min-width: 960px) 560px, 100vw" alt="Trufa sabor {nome} na palma da mão, para referência de tamanho" width="800" height="800" loading="lazy" decoding="async" draggable="false">
        </div>
        <button type="button" class="seta seta-ant" data-ir="-1" aria-label="Foto anterior">&#8249;</button>
        <button type="button" class="seta seta-prox" data-ir="1" aria-label="Próxima foto">&#8250;</button>
        <div class="detalhe-pontos" role="group" aria-label="Escolher foto">
          <button type="button" data-foto="0" aria-label="Foto da trufa" aria-current="true"></button>
          <button type="button" data-foto="1" aria-label="Foto na mão"></button>
        </div>
        <p class="detalhe-legenda" aria-live="polite">A trufa por dentro</p>
      </div>

      <div class="produto-info">
        <p class="produto-rotulo">Trufa artesanal</p>
        <h1 id="produto-nome">{nome}</h1>
        <p class="detalhe-preco">R$ 4,99 <span>por trufa</span></p>
        <p class="produto-peso"><strong>45 g</strong> <span>em média por trufa. Mais que o dobro de um bombom industrial comum.</span></p>
        <p class="produto-chamada">{escape(s['chamada'])}</p>
        <p class="produto-pausa">{escape(s['pausa'])}</p>

        <div class="detalhe-acao" data-slug="{slug}">
          <button type="button" class="add" data-acao="+" aria-label="Adicionar {nome} ao pedido">Adicionar ao pedido</button>
          <div class="stepper"><button type="button" data-acao="-" aria-label="Remover uma {nome}">−</button><output aria-live="polite">0</output><button type="button" data-acao="+" aria-label="Adicionar mais uma {nome}">+</button></div>
        </div>

        <dl class="produto-ficha">
          <div><dt>Recheio</dt><dd>{escape(s['desc'])}</dd></div>
          <div><dt>Peso</dt><dd>Cerca de 45 g por unidade</dd></div>
          <div><dt>Embalagem</dt><dd>Embrulhada individualmente em papel metalizado {s['papel']}</dd></div>
          <div><dt>Preparo</dt><dd>Feita à mão, uma a uma</dd></div>
        </dl>
        <p class="detalhe-nota">Imagens ilustrativas.</p>
      </div>
    </section>

    <section class="secao produto-porque" aria-labelledby="t-porque">
      <div class="wrap">
        <div class="secao-cabeca">
          <h2 id="t-porque">Não é bombom de prateleira.</h2>
          <p>Trufa de verdade pede tempo, mão e recheio.</p>
        </div>
        <ul class="diferencas">
          <li>
            <strong class="dif-num">45 g</strong>
            <h3>Uma pausa inteira, não uma mordida</h3>
            <p>Mais que o dobro de um bombom industrial comum, que costuma ficar entre 12 e 22 g.</p>
          </li>
          <li>
            <strong class="dif-num">1 a 1</strong>
            <h3>Feita à mão, não em linha de produção</h3>
            <p>Cada trufa é recheada, fechada e embrulhada à mão. Sem esteira e sem meses parada na prateleira.</p>
          </li>
          <li>
            <strong class="dif-num">+ recheio</strong>
            <h3>Recheio cremoso de verdade</h3>
            <p>Casca de chocolate e muito recheio. Na primeira mordida você sente o sabor, não só o açúcar.</p>
          </li>
        </ul>
      </div>
    </section>

    <section class="secao outros" aria-labelledby="t-outros">
      <div class="wrap">
        <div class="secao-cabeca">
          <h2 id="t-outros">Monte a sua caixa</h2>
          <p>Todos os sabores a R$ 4,99. O que você adicionar fica no mesmo pedido.</p>
        </div>
        <ul class="outros-lista">
{outros(s)}
        </ul>
      </div>
    </section>
  </main>

  <footer>
    <div class="wrap">
      <div class="rodape-grid">
        <div>
          <span class="logo" aria-hidden="true"><em>doce</em>afeto</span>
          <p class="rodape-desc">Trufas artesanais de 45 g, feitas à mão para a sua pausa do dia.</p>
        </div>
        <div>
          <p>R$ 4,99 a unidade</p>
          <p>Pedidos pelo WhatsApp <a href="https://wa.me/5511964562656" target="_blank" rel="noopener">(11) 96456-2656</a></p>
        </div>
      </div>
      <p class="rodape-base">Doce Afeto. Imagens ilustrativas.</p>
    </div>
  </footer>

  <dialog class="pedido-dialog" id="pedido-dialog" aria-labelledby="pedido-titulo">
    <form class="pedido-form" id="pedido-form">
      <h2 id="pedido-titulo">Só falta seus dados.</h2>
      <p>Informe seu nome e WhatsApp para registrar o pedido. Depois, você poderá confirmar pelo WhatsApp.</p>
      <label for="cliente-nome">Seu nome
        <input id="cliente-nome" name="nome" autocomplete="name" maxlength="100" required placeholder="Como podemos te chamar?">
      </label>
      <label for="cliente-whatsapp">Seu WhatsApp
        <input id="cliente-whatsapp" name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" required placeholder="(11) 99999-9999">
      </label>
      <p class="pedido-status" id="pedido-status" role="status" aria-live="polite"></p>
      <div class="pedido-form-acoes">
        <button class="btn btn-linha" type="button" id="pedido-cancelar">Voltar</button>
        <button class="btn" type="submit" id="pedido-confirmar">Registrar e continuar</button>
      </div>
    </form>
  </dialog>

  <div class="barra vazia" id="barra" role="region" aria-label="Seu pedido">
    <div class="wrap">
      <div class="resumo" aria-live="polite">
        <p class="resumo-linha"><span class="resumo-total" id="total">R$ 0,00</span><span class="resumo-qtd" id="qtd"></span></p>
        <span class="resumo-itens" id="itens">Seu pedido está vazio</span>
      </div>
      <a class="btn btn-linha" id="enviar" href="../index.html#sabores">
        <span id="enviar-txt">Escolher sabores</span>
      </a>
    </div>
  </div>

  <script src="../js/main.js"></script>
</body>
</html>
'''


if __name__ == "__main__":
    pasta = RAIZ / "sabor"
    pasta.mkdir(exist_ok=True)
    for s in SABORES:
        (pasta / f"{s['slug']}.html").write_text(pagina(s), encoding="utf-8", newline="\n")
        print("ok", f"sabor/{s['slug']}.html")
