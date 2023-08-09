<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="github-markdown-dark.css">
<link rel="stylesheet" href="github-markdown-custom.css">
<link rel="stylesheet" href="gallery-style.css">

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

<div class="img-frame">
    <input type="checkbox" class="toggle-button"/>
    <img class="small-img"
  src="src/img/server-dark/server_only.svg"
  alt="triangle with all three sides equal"/>
</div>

## Client

### Prediction system
<div class="img-frame">
    <input type="checkbox" class="toggle-button"/>
    <img class="small-img"
  src="src/img/server-dark/client_only.svg"
  alt="triangle with all three sides equal"/>
</div>

### Render system
<div class="img-frame">
    <input type="checkbox" class="toggle-button"/>
    <img class="small-img"
  src="src/img/server-dark/client_render.svg"
  alt="triangle with all three sides equal"/>
</div>

## Client-Server interaction
### 1. Client state disproved
<div class="img-frame">
    <input type="checkbox" class="toggle-button"/>
    <img class="small-img"
  src="src/img/server-dark/client_disproved.svg"
  alt="triangle with all three sides equal"/>
</div>

### 2. Client state approved

<div class="img-frame">
    <input type="checkbox" class="toggle-button"/>
    <img class="small-img"
  src="src/img/server-dark/client_approved.svg"
  alt="triangle with all three sides equal"/>
</div>

### 3. Client state outdated

<div class="img-frame">
    <input type="checkbox" class="toggle-button"/>
<img class="small-img"
  src="src/img/server-dark/client_outdated.svg"
  alt="triangle with all three sides equal"/>
</div>

### 4. Client state is too far in future

<div class="img-frame">
    <input type="checkbox" class="toggle-button"/>
<img class="small-img"
  src="src/img/server-dark/too_predicted.svg"
  alt="triangle with all three sides equal"/>
</div>


### 5. Disconnected

<div class="img-frame">
    <input type="checkbox" class="toggle-button"/>
<img class="small-img"
  src="src/img/server-dark/no_connection.svg"
  alt="triangle with all three sides equal"/>
</div>


<!-- <details open>
<summary><big>Full Diagram</big></summary>

<div class="img-frame">
    <input type="checkbox" class="toggle-button"/>
    <img class="small-img"
  src="src/img/server-dark/server.svg"
  alt="triangle with all three sides equal"/>
</div>

</details> -->


</article>