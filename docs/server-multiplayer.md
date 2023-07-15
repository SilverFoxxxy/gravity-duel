<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="github-markdown-dark.css">
<link rel="stylesheet" href="github-markdown-custom.css">

<article class="markdown-body">


# Server tech doc

Solves synchronization problems

# Concept

*Basic idea:*
- **Authoritorian server**

    (Everything happens ***on server only***)
- Player sends ***keys input*** to server
- Server sends ***game state*** to player

*Important:*
- Server ***does not care*** about client

    *(Almost)*

*Improvement N1:*
- Client ***predicts*** next states
- Server sends ***game state*** ->

    -> client ***compares*** it with prediction

# 1 Client Architecture

## Server
- **state_5** - *game state* number *5* **produced by server**
- **pstate_5** - *game state* number *5* **predicted by client**
- **ctrl_2** - *controls state* before calculating:
    - **state_2** (on **server**)
    - **pstate_2** (on **client**)
    - **ctrl_2** is ***different*** for **server** and for **client**:
        - **client** only ***predicts*** itself controls state (before he gets **state_2** from **server**)

<img
  src="src/img/server-dark/server_only.svg"
  alt="triangle with all three sides equal"/>

## Client

<img
  src="src/img/server-dark/client_only.svg"
  alt="triangle with all three sides equal"/>

## Client-Server interaction
### 1. Client state disproved
<img
  src="src/img/server-dark/client_disproved.svg"
  alt="triangle with all three sides equal"
  style="height:50vh; max-height: calc(900px * 1);"/>

### 2. Client state approved

<img
  src="src/img/server-dark/client_approved.svg"
  alt="triangle with all three sides equal"
  style="height:50vh; max-height: calc(900px * 1);"/>

### 3. Client state outdated

<img
  src="src/img/server-dark/client_outdated.svg"
  alt="triangle with all three sides equal"
  style="height:50vh; max-height: calc(900px * 1);"/>

<details>
<summary><big>Full Diagram</big></summary>

<img
  src="src/img/server-dark/server.svg"
  alt="triangle with all three sides equal"/>

</details>


</article>