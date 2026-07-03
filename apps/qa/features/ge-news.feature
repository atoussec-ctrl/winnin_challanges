Feature: Noticias esportivas no ge.globo.com

  Scenario: Pagina inicial lista noticias com conteudo minimo
    Given que o usuario acessa a home do ge
    Then a pagina deve exibir pelo menos 10 noticias
    And cada noticia deve conter titulo, imagem e resumo

  Scenario: Usuario abre uma noticia completa
    Given que o usuario acessa a home do ge
    When ele abre a primeira noticia
    Then deve ser redirecionado para a materia completa

  Scenario: Usuario navega para pagina de clube da Serie A
    Given que o usuario acessa a home do ge
    When ele seleciona um clube da Serie A
    Then deve visualizar noticias relacionadas ao clube

