export type Afirmacao = {
  frase: string;
  ancora: string;
  pergunta: string;
  pratica: string;
};

/**
 * A frase do dia é determinística: a mesma data sempre traz a mesma
 * afirmação, para virar ritual e não novidade aleatória.
 */
export const AFIRMACOES: Afirmacao[] = [
  {
    frase: "Eu estou aqui. Antes de fazer, eu habito o agora.",
    ancora: "Sinta os pés no chão. Solte os ombros. Você não precisa resolver tudo hoje.",
    pergunta: "O que está acontecendo agora — não na minha cabeça, mas no meu corpo?",
    pratica: "Pare por 3 respirações antes de abrir a próxima tarefa.",
  },
  {
    frase: "Presença é a base de qualquer execução com sentido.",
    ancora: "Faça uma coisa por vez. O resto pode esperar até terminar esta.",
    pergunta: "Qual é a única coisa que, se feita agora, muda o dia?",
    pratica: "Feche as abas que não pertencem à tarefa atual.",
  },
  {
    frase: "Eu não sou a pressa. Eu escolho o ritmo.",
    ancora: "Respire mais devagar do que o impulso pede. O ritmo é uma decisão.",
    pergunta: "Estou correndo para terminar ou correndo para não sentir?",
    pratica: "Faça a próxima tarefa em uma janela só, sem trocar de contexto.",
  },
  {
    frase: "Ancorar é voltar. Quantas vezes forem necessárias.",
    ancora: "Pés, respiração, uma frase: “estou aqui”. O pensamento pode ir e voltar.",
    pergunta: "Para onde minha atenção fugiu agora?",
    pratica: "Volte ao corpo por 60 segundos antes de decidir qualquer coisa.",
  },
  {
    frase: "Eu posso fazer o suficiente. O suficiente é uma escolha, não uma falta.",
    ancora: "Defina o bastante antes de começar. Sem isso, nunca termina.",
    pergunta: "O que seria suficiente para hoje — de verdade?",
    pratica: "Escreva o critério de “pronto” antes de abrir a tarefa.",
  },
  {
    frase: "Gratidão não é fingir que está tudo bem. É reconhecer o que sustentou você até aqui.",
    ancora: "Nomeie três coisas concretas: uma pessoa, um corpo, um pequeno gesto.",
    pergunta: "O que hoje me carregou sem eu perceber?",
    pratica: "Agradeça em voz alta a uma pessoa que facilitou o seu dia.",
  },
  {
    frase: "Perdoar é devolver o peso que não é meu.",
    ancora: "Não é concordar. É parar de carregar. Solte uma coisa por vez.",
    pergunta: "O que eu estou carregando que já pode ficar no passado?",
    pratica: "Escreva uma frase de soltura e não a releia hoje.",
  },
  {
    frase: "Eu volto ao essencial: uma respiração, um passo, uma decisão.",
    ancora: "Quando o dia fica grande, diminua o próximo movimento até caber em 10 minutos.",
    pergunta: "Qual é o próximo passo que cabe no meu tamanho de hoje?",
    pratica: "Quebre a tarefa grande em uma ação de 10 minutos e comece por ela.",
  },
  {
    frase: "Clareza não é ter todas as respostas. É saber a próxima pergunta.",
    ancora: "Antes de executar, nomeie o que você está tentando descobrir.",
    pergunta: "Qual pergunta, se respondida, destrava o resto?",
    pratica: "Escreva uma pergunta em vez de uma tarefa quando ainda houver névoa.",
  },
  {
    frase: "Meu corpo é o primeiro lugar onde a vida acontece.",
    ancora: "Ombros, mandíbula, barriga. Onde você está segurando o dia?",
    pergunta: "O que meu corpo está pedindo e eu estou ignorando?",
    pratica: "Beba água e alongue por 2 minutos antes da próxima janela.",
  },
  {
    frase: "Eu não preciso provar nada agora. Preciso estar inteira agora.",
    ancora: "Performance cansa. Presença sustenta. Escolha uma entrega, não uma máscara.",
    pergunta: "Estou tentando ser vista ou tentando ser fiel ao que importa?",
    pratica: "Faça a próxima ação sem postar, sem mostrar, sem medir.",
  },
  {
    frase: "O dia não é uma fila. É um ritmo.",
    ancora: "Alterne esforço e pausa. A pausa faz parte da execução, não é prêmio.",
    pergunta: "Qual foi a última vez que eu respirei sem tela na mão?",
    pratica: "Coloque uma pausa de 5 minutos entre duas tarefas densas.",
  },
  {
    frase: "Eu escolho o que merece a minha atenção hoje.",
    ancora: "Atenção é o recurso mais caro que você tem. Gaste com intenção.",
    pergunta: "O que está consumindo minha atenção sem devolver nada?",
    pratica: "Desligue uma notificação que não serve ao dia de hoje.",
  },
  {
    frase: "Fazer o simples bem feito também é uma forma de oração.",
    ancora: "Lave a louça, responda a mensagem, termine o pequeno. O sagrado está no detalhe.",
    pergunta: "Qual pequena coisa eu estou deixando inacabada por vaidade?",
    pratica: "Termine uma tarefa pequena por completo antes de abrir outra.",
  },
  {
    frase: "Eu posso recomeçar a qualquer hora do dia.",
    ancora: "Não existe dia perdido enquanto houver uma próxima escolha.",
    pergunta: "O que eu faria se este fosse o primeiro minuto do dia?",
    pratica: "Reinicie o ritmo com 3 respirações e uma prioridade só.",
  },
  {
    frase: "Perdão começa por mim: eu não preciso ser perfeita para seguir.",
    ancora: "Reconheça o erro sem transformá-lo em identidade. Aprenda e siga.",
    pergunta: "Qual erro eu estou usando como prova de que não mereço continuar?",
    pratica: "Escreva: “errei nisso, aprendo isso, sigo com isso”.",
  },
  {
    frase: "Gratidão é memória do bem. Perdão é liberdade do peso.",
    ancora: "Uma coisa que fica, uma coisa que vai. O dia cabe nesse movimento.",
    pergunta: "O que eu quero levar e o que eu quero deixar hoje?",
    pratica: "Antes de dormir, registre uma gratidão e uma soltura.",
  },
  {
    frase: "Eu estou no meu corpo, no meu tempo, na minha vida.",
    ancora: "Não na vida dos outros, não no futuro, não no medo. Aqui.",
    pergunta: "Onde eu estou quando não estou aqui?",
    pratica: "Toque os pés no chão e diga em silêncio: “eu estou aqui”.",
  },
  {
    frase: "Executar é um ato de cuidado, não de cobrança.",
    ancora: "Faça o que prometeu a si mesma com a mesma gentileza que faria a alguém que ama.",
    pergunta: "Como eu posso fazer isso sem me violentar?",
    pratica: "Defina um limite de tempo e cumpra o limite, não a perfeição.",
  },
  {
    frase: "O que é importante hoje não precisa competir com tudo.",
    ancora: "Escolha três. O resto é contexto. O resto pode esperar.",
    pergunta: "Quais três coisas tornam o dia digno de ter sido vivido?",
    pratica: "Olhe as prioridades e risque uma coisa que não é para hoje.",
  },
  {
    frase: "Eu confio no ritmo lento que constrói o que dura.",
    ancora: "Constância vence intensidade. Um pouco todo dia ainda é caminho.",
    pergunta: "O que eu estou tentando acelerar que só o tempo resolve?",
    pratica: "Faça 15 minutos da tarefa importante, mesmo sem terminar.",
  },
  {
    frase: "Eu não preciso carregar o mundo para ser útil.",
    ancora: "Servir transborda; não esvazia. Primeiro eu, depois o que eu sirvo.",
    pergunta: "O que eu estou fazendo por culpa e não por escolha?",
    pratica: "Diga não a uma coisa pequena hoje para dizer sim ao essencial.",
  },
  {
    frase: "Estar presente é a forma mais simples de respeito.",
    ancora: "Escute até o fim. Olhe nos olhos. Não prepare a resposta enquanto o outro fala.",
    pergunta: "Quem eu estou ouvindo de verdade — e quem eu estou só esperando falar?",
    pratica: "Em uma conversa hoje, escute 30 segundos sem interromper.",
  },
  {
    frase: "Meu valor não está na lista de coisas feitas.",
    ancora: "A lista é ferramenta, não identidade. Você já é inteira antes de produzir.",
    pergunta: "Quem eu seria se hoje não riscasse nada da lista?",
    pratica: "Faça uma pausa sem merecer: 5 minutos sem produtividade.",
  },
  {
    frase: "A paz também é uma decisão de ritmo.",
    ancora: "Diminua a velocidade de uma ação hoje. Só uma. Sinta a diferença.",
    pergunta: "Onde eu posso fazer mais devagar sem perder nada?",
    pratica: "Coma ou caminhe 5 minutos sem tela e sem pressa.",
  },
  {
    frase: "Eu acolho o que sinto sem entregar a direção a isso.",
    ancora: "Sentir é informação. Não é ordem. Respire e escolha o próximo passo.",
    pergunta: "O que este sentimento está tentando me mostrar?",
    pratica: "Nomeie a emoção em uma palavra e respire antes de agir.",
  },
  {
    frase: "Ancorar não é parar a vida. É não se perder dentro dela.",
    ancora: "Uma âncora por dia já muda o rumo de uma semana.",
    pergunta: "Qual âncora eu quero repetir amanhã?",
    pratica: "Marque uma prática como feita e note como o corpo respondeu.",
  },
  {
    frase: "Eu faço o meu melhor com o que tenho, e isso é suficiente por hoje.",
    ancora: "Recursos, energia e tempo são finitos. O suficiente também é uma entrega.",
    pergunta: "O que eu estou exigindo de mim que não é possível hoje?",
    pratica: "Ajuste uma expectativa para caber na sua energia real.",
  },
  {
    frase: "Gratidão pelo que já floresceu. Coragem para o que ainda é semente.",
    ancora: "Nem tudo está visível. Confie no que você plantou e continua regando.",
    pergunta: "O que está crescendo devagar e eu ainda não reconheci?",
    pratica: "Registre um progresso pequeno que ninguém viu.",
  },
  {
    frase: "Eu solto o controle do resultado e seguro a presença no processo.",
    ancora: "Faça a parte que é sua. O resto tem o tempo que tem.",
    pergunta: "O que eu posso entregar e o que eu não posso garantir?",
    pratica: "Defina o que está sob seu controle antes de começar.",
  },
  {
    frase: "Perdão é escolher não beber o veneno que sobrou.",
    ancora: "Você não precisa esquecer. Precisa parar de se envenenar com a lembrança.",
    pergunta: "O que eu ainda repito na cabeça esperando um final diferente?",
    pratica: "Respire fundo e diga: “eu solto o que não posso mudar”.",
  },
];

const DIA = 86400000;

export function indiceDoDia(data: Date = new Date()): number {
  const dias = Math.floor(
    Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()) / DIA,
  );
  return ((dias % AFIRMACOES.length) + AFIRMACOES.length) % AFIRMACOES.length;
}

export function afirmacaoDoDia(data: Date = new Date()): Afirmacao {
  return AFIRMACOES[indiceDoDia(data)];
}

export type Pratica = {
  chave: string;
  titulo: string;
  subtitulo: string;
  descricao: string;
  minutos: number;
  tom: "janela" | "foco" | "feito" | "ouro" | "revisao" | "notas";
  campo?: "texto";
  placeholder?: string;
};

export const PRATICAS: Pratica[] = [
  {
    chave: "presenca",
    titulo: "Esteja presente",
    subtitulo: "1 min · parar",
    descricao:
      "Pare onde está. Sinta os pés no chão, solte os ombros e diga em silêncio: “eu estou aqui”.",
    minutos: 1,
    tom: "janela",
  },
  {
    chave: "respiracao",
    titulo: "Respire e ancore",
    subtitulo: "2 min · corpo",
    descricao:
      "Três respirações lentas: inspire em 4, segure em 4, solte em 6. Deixe o ar fazer o trabalho.",
    minutos: 2,
    tom: "foco",
  },
  {
    chave: "corpo",
    titulo: "Sinta o corpo",
    subtitulo: "2 min · aterrar",
    descricao:
      "Passe a atenção pelos pés, pernas, mãos, peito e rosto. Onde está tenso, respire para lá.",
    minutos: 2,
    tom: "feito",
  },
  {
    chave: "gratidao",
    titulo: "Gratidão concreta",
    subtitulo: "3 min · memória do bem",
    descricao:
      "Nomeie três coisas concretas de hoje — uma pessoa, um corpo, um pequeno gesto. Sem generalizar.",
    minutos: 3,
    tom: "ouro",
    campo: "texto",
    placeholder: "Hoje me sustentou…\n1.\n2.\n3.",
  },
  {
    chave: "perdao",
    titulo: "Perdão e soltura",
    subtitulo: "3 min · devolver o peso",
    descricao:
      "Escolha uma coisa que não precisa mais ocupar espaço. Não é concordar: é parar de carregar.",
    minutos: 3,
    tom: "revisao",
    campo: "texto",
    placeholder: "Eu solto… (um erro meu, uma expectativa, uma mágoa)",
  },
  {
    chave: "intencao",
    titulo: "Intenção do dia",
    subtitulo: "1 min · rumo",
    descricao:
      "Uma palavra ou frase que orienta o dia. Não é meta: é direção para as escolhas pequenas.",
    minutos: 1,
    tom: "notas",
    campo: "texto",
    placeholder: "Hoje eu escolho…",
  },
];

export function praticaPorChave(chave: string): Pratica | undefined {
  return PRATICAS.find((p) => p.chave === chave);
}
