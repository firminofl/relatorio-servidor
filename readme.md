# Serviço de disponibilidade/indisponibilidade do servidor

## Resumo
Serviço que entrega o tempo de disponibilidade/indisponibilidade do servidor se atentando ao registro SIP do asterisk em uma central ou outro device.
De minuto a minuto o serviço consulta o status de um registro X e verifica se houve alteração de status, se sim grava o evento com a sua descrição e data/hora que ocorreu.

## Lista de afazeres
#### Automatizado
- [] Monitorar o registro SIP do asterisk.
- [] Se o status atual for diferente do anterior, gravar na base de dados.

#### Interativo
- [] Usuário envia data de início e fim para o backend.
- [] Validar as datas.
- [] Trazer os dados da base no período especificado.

|  id |  status   | data_hora             |
| :-: | :-------: | :-------------------: |
|  1  |    REG    | 2020-01-01 00:00:00   |
|  2  |    NRE    | 2020-01-31 23:59:00   |
|  3  |    REG    | 2020-02-02 15:00:00   |
|  4  |    NRE    | 2020-03-31 23:59:00   |

#### status:
1. Registrado (REG)
2. Não registrado (NRE)

#### condicionais
1. data início -> data fim (ficou indisponível ou disponível)?

|  id |  status   | data_hora             |
| :-: | :-------: | :-------------------: |
----

2. REG -> data fim (ficou disponível por X tempo);

|  id |  status   | data_hora             |
| :-: | :-------: | :-------------------: |
|  1  |    REG    | 2020-01-01 00:00:00   |

3. REG -> NRE (ficou disponível por X tempo);

|  id |  status   | data_hora             |
| :-: | :-------: | :-------------------: |
|  1  |    REG    | 2020-01-01 00:00:00   |
|  2  |    NRE    | 2020-01-31 23:59:00   |


3. REG -> NRE -> REG (ficou disponível por X tempo);

|  id |  status   | data_hora             |
| :-: | :-------: | :-------------------: |
|  1  |    REG    | 2020-01-01 00:00:00   |
|  2  |    NRE    | 2020-01-31 23:59:00   |
|  3  |    REG    | 2020-02-01 00:00:00   |


-----

4. NRE -> data fim (ficou indisponível por X tempo);

|  id |  status   | data_hora             |
| :-: | :-------: | :-------------------: |
|  1  |    NRE    | 2020-01-31 23:59:00   |


5. NRE -> REG (ficou indisponível por X tempo;

|  id |  status   | data_hora             |
| :-: | :-------: | :-------------------: |
|  1  |    NRE    | 2020-01-31 23:59:00   |
|  2  |    REG    | 2020-02-02 15:00:00   |
|  3  |    NRE    | 2020-02-03 23:59:00   |
----