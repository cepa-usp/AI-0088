var learnername = ""; // Nome do aluno
var completed = false; // Status da AI: completada ou não
var score = 0; // Nota do aluno (de 0 a 100)
var scormExercise = 1; // Exercício corrente relevante ao SCORM
var screenExercise = 1; // Exercício atualmente visto pelo aluno (não tem relação com scormExercise)
var N_EXERCISES = 6; // Quantidade de exercícios desta AI
var scorm = pipwerks.SCORM; // Seção SCORM
scorm.version = "2004"; // Versão da API SCORM
var PING_INTERVAL = 5 * 60 * 1000; // milissegundos
var pingCount = 0; // Conta a quantidade de pings enviados para o LMS
var ai; // Referência para a AI (Flash)
var SCORE_UNIT = 100 / 24;
var state = {};

$(document).ready(initAI); // Inicia a AI.
$(window).unload(uninitAI); // Encerra a AI.

/*
 * Configurações iniciais da Atividade Interativa (AI)
 */ 
function initAI () {

  // Carrega o SWF
  swfobject.embedSWF("AI-0083.swf", "ai-container", flashvars.width, flashvars.height, "10.0.0", "expressInstall.swf", flashvars, params, attributes);
  ai = document.getElementById(attributes.id);
  
  /* TESTE */  
  /*ai.getPeriodo = function () {return 4.4;};
  ai.getComprimento = function () {return 5;};
  ai.getGravidade = function () {return 10;};
  ai.getTeta = function () {return 10;};
  ai.getMaxVelAngular = function () {return 0.25;};
  ai.showHideMHS = function (visible) { console.log("Esconde o MHS"); };
  ai.setGravity = function (g) { console.log("Gravidade -> " + g);};
  ai.hideGravidade = function () {console.log("Esconde gravidade");};
  ai.playAnimation = function () {console.log("Play animação");};
  ai.showHideGravidade = function () {};
  ai.getVelocidade = function () {return 0.24;};
  ai.setTeta = function (t) {console.log("Define theta = 10");};
  ai.getMassa = function (t) {return 5;} */   
  /* TESTE */
  
  // Ao pressionar numa aba (exercício), define aquele como exercício da tela.
  $('#exercicios').tabs({
      select: function(event, ui) {
        screenExercise = ui.index;
        ai.showHideMHS(false);
        
        if (screenExercise == 2 || screenExercise == 3) {
          if (Math.abs(ai.getTeta()) < 1) {
            ai.setTeta(10);
            ai.playAnimation();
          }
        }
        else if (screenExercise == 5 || screenExercise == 6) {
          if (Math.abs(ai.getTeta()) < 1) {
            ai.setTeta(90);
            ai.playAnimation();
          }
        }
      }
  });
  
  $("#follow-up-ex2").hide();
  $("#follow-up-ex3").hide();
  $("#follow-up-ex6").hide();
  
  // Ao pressionar num botão "terminei", avalia o exercício da vez (scormExercise)
  $('.check-button').button().click(evaluateExercise);
  
  initSCORM();
  
  // (Re)abilita os exercícios já feitos e desabilita aqueles ainda por fazer.
  if (completed) $('#exercicios').tabs("option", "disabled", []);
  else {
    for (i = 0; i <= N_EXERCISES; i++) {
      if (i <= scormExercise) $('#exercicios').tabs("enable", i);
      else $('#exercicios').tabs("disable", i);
    }
  }
  
  // Posiciona o aluno no exercício da vez
  screenExercise = scormExercise;
  $('#exercicios').tabs("select", scormExercise - 1);
}

/*
 * Encerra a Atividade Interativa (AI)
 */ 
function uninitAI () {
  if (!completed) {
    save2LMS();
    scorm.quit();
  }
}

/*
 * Inicia a conexão SCORM.
 */ 
function initSCORM () {
 
  // Conecta-se ao LMS
  var connected = scorm.init();
  
  // A tentativa de conexão com o LMS foi bem sucedida.
  if (connected) {
  
    // Verifica se a AI já foi concluída.
    var completionstatus = scorm.get("cmi.completion_status");
    
    // A AI já foi concluída.
    switch (completionstatus) {
    
      // Primeiro acesso à AI
      case "not attempted":
      case "unknown":
      default:
        completed = false;
        learnername = scorm.get("cmi.learner_name");
        scormExercise = 1;
        score = 0;
        
        $("#completion-message").removeClass().addClass("completion-message-off");    
        break;
        
      // Continuando a AI...
      case "incomplete":
        completed = false;
        learnername = scorm.get("cmi.learner_name");
        scormExercise = parseInt(scorm.get("cmi.location"));
        score = parseInt(scorm.get("cmi.score.raw"));
        
        $("#completion-message").removeClass().addClass("completion-message-off");
        break;
        
      // A AI já foi completada.
      case "completed":
        completed = true;
        learnername = scorm.get("cmi.learner_name");
        scormExercise = parseInt(scorm.get("cmi.location"));
        score = parseInt(scorm.get("cmi.score.raw"));
        
        $("#completion-message").removeClass().addClass("completion-message-on");
        break;
    }
    
    if (isNaN(scormExercise)) scormExercise = 1;
    if (isNaN(score)) score = 0;
    
    pingLMS();
    
  }
  // A tentativa de conexão com o LMS falhou.
  else {
    completed = false;
    learnername = "";
    scormExercise = 1;
    score = 0;
    log.error("A conexão com o Moodle falhou.");
  }
}

/*
 * Salva cmi.score.raw, cmi.location e cmi.completion_status no LMS
 */ 
function save2LMS () {
  if (scorm.connection.isActive) {
  
    // Salva no LMS a nota do aluno.
    var success = scorm.set("cmi.score.raw", Math.round(score));
  
    // Notifica o LMS que esta atividade foi concluída.
    success = scorm.set("cmi.completion_status", (completed ? "completed" : "incomplete"));
    
    // Salva no LMS o exercício que deve ser exibido quando a AI for acessada novamente.
    success = scorm.set("cmi.location", scormExercise);
    
    if (!success) log.error("Falha ao enviar dados para o LMS.");
  }
  else {
    log.trace("A conexão com o LMS não está ativa.");
  }
}

/*
 * Mantém a conexão com LMS ativa, atualizando a variável cmi.session_time
 */
function pingLMS () {

	scorm.get("cmi.completion_status");
	var timer = setTimeout("pingLMS()", PING_INTERVAL);
}

/*
 * Prepara o próximo exercício.
 */ 
function nextExercise () {
  if (scormExercise < N_EXERCISES) ++scormExercise;
  
  $('#exercicios').tabs("enable", scormExercise);
}

/*
 * Avalia a resposta do aluno ao exercício atual. Esta função é executada sempre que ele pressiona "terminei".
 */ 
function evaluateExercise (event) {

  var currentScore = 0;
  var angle = 0;

  switch (screenExercise) {
  
    // Avalia a nota dos exercícios 1 e 4
    // ----------------------------------
    case 1:
    case 4:
    default:
    
      var success = true;
    
      var angle = (screenExercise == 1 ? 10 : 90);
      var field = $("#U-top-ex" + screenExercise);
      var user_answer = parseFloat(field.val().replace(",", "."));
      var right_answer = ai.getMassa() * ai.getGravidade() * ai.getComprimento() * (1 - Math.cos(angle * Math.PI / 180));
      var energy = right_answer;
      
      console.log("------ U no topo");
      console.log("Usuário: " + user_answer);
      console.log("Resposta esperada: " + right_answer);
      
      if (Math.abs(user_answer - right_answer) <= 0.05 * Math.abs(right_answer)) {
        currentScore += SCORE_UNIT;
        field.css("background-color", "#33CC33");
        
        if (screenExercise == 1) state.u_top_ex1 = user_answer;
        else state.u_top_ex4 = user_answer;
      }
      else {
        success = false;
        field.val(right_answer.toFixed(1).replace(".", ","));
        field.css("background-color", "#CC3333");
        updateError(screenExercise);
        updateEnergy(screenExercise);
      }
      
      field = $("#K-top-ex" + screenExercise);
      user_answer = parseFloat(field.val().replace(",", "."));
      right_answer = 0;
         
      console.log("------ K no topo");
      console.log("Usuário: " + user_answer);
      console.log("Resposta esperada: " + right_answer);
            
      if (Math.abs(user_answer - right_answer) <= 0.05 * Math.abs(right_answer)) {
        currentScore += SCORE_UNIT;
        field.css("background-color", "#33CC33");
      }
      else {
        success = false;
        field.val(right_answer.toFixed(1).replace(".", ","));
        field.css("background-color", "#CC3333");
        updateError(screenExercise);
        updateEnergy(screenExercise);
      }            
            
      field = $("#U-bottom-ex" + screenExercise);
      user_answer = parseFloat(field.val().replace(",", "."));
      right_answer = 0;
      
      console.log("----- U na base");
      console.log("Usuário: " + user_answer);
      console.log("Resposta esperada: " + right_answer);
      
      if (Math.abs(user_answer - right_answer) <= 0.05 * Math.abs(right_answer)) {
        currentScore += SCORE_UNIT;
        field.css("background-color", "#33CC33");
      }
      else {
        success = false;
        field.val(right_answer.toFixed(1).replace(".", ","));
        field.css("background-color", "#CC3333");
        updateError(screenExercise);
        updateEnergy(screenExercise);
      }
      
      field = $("#K-bottom-ex" + screenExercise);
      user_answer = parseFloat(field.val().replace(",", "."));
      right_answer = energy;
       
      console.log("------ K na base");
      console.log("Usuário: " + user_answer);
      console.log("Resposta esperada: " + right_answer);
           
      if (Math.abs(user_answer - right_answer) <= 0.05 * Math.abs(right_answer)) {
        currentScore += SCORE_UNIT;
        field.css("background-color", "#33CC33");
      }
      else {
        success = false;
        field.val(right_answer.toFixed(1).replace(".", ","));
        field.css("background-color", "#CC3333");
        updateError(screenExercise);
        updateEnergy(screenExercise);
      }
      
      if (success) {
        $("#feedback-ex" + screenExercise).html('Correto!');
        $("#feedback-ex" + screenExercise).removeClass().addClass("right-answer");
      }
      else {
        $("#feedback-ex" + screenExercise).html("Ao menos uma de suas respostas estava incorreta (campos destacados em vermelho). Elas foram automaticamente substituídas pela resposta certa.");
        $("#feedback-ex" + screenExercise).removeClass().addClass("wrong-answer");
      }
      
      break;
      
    // Avalia a nota dos exercícios 2 e 5
    // ----------------------------------
    case 2:
    case 5:

      var success = true;
    
      var field = $("#U-top-ex" + screenExercise);
      var user_answer = parseFloat(field.val().replace(",", "."));
      var right_answer = ai.getMassa() * ai.getGravidade() * ai.getComprimento() * (1 - Math.cos(ai.getTeta() * Math.PI / 180));
      
      console.log("------- U no topo");
      console.log("Usuário: " + user_answer);
      console.log("Resposta esperada: " + right_answer);
      
      if (Math.abs(user_answer - right_answer) <= 0.22 * Math.abs(right_answer)) {
        currentScore += SCORE_UNIT;
        field.css("background-color", "#33CC33");
      }
      else {
        success = false;
        field.val(right_answer.toFixed(1).replace(".", ","));
        field.css("background-color", "#CC3333");
        updateError(screenExercise);
        updateEnergy(screenExercise);
      }
      
      field = $("#K-top-ex" + screenExercise);
      user_answer = parseFloat(field.val().replace(",", "."));
      right_answer = 0;
      
      console.log("------- K no topo");
      console.log("Usuário: " + user_answer);
      console.log("Resposta esperada: " + right_answer);
            
      if (Math.abs(user_answer - right_answer) <= 0.05 * Math.abs(right_answer)) {
        currentScore += SCORE_UNIT;
        field.css("background-color", "#33CC33");
      }
      else {
        success = false;
        field.val(right_answer.toFixed(1).replace(".", ","));
        field.css("background-color", "#CC3333");
        updateError(screenExercise);
        updateEnergy(screenExercise);
      }            
            
      field = $("#U-bottom-ex" + screenExercise);
      user_answer = parseFloat(field.val().replace(",", "."));
      right_answer = 0;
      
      console.log("----- U na base");
      console.log("Usuário: " + user_answer);
      console.log("Resposta esperada: " + right_answer);
      
      if (Math.abs(user_answer - right_answer) <= 0.05 * Math.abs(right_answer)) {
        currentScore += SCORE_UNIT;
        field.css("background-color", "#33CC33");
      }
      else {
        success = false;
        field.val(right_answer.toFixed(1).replace(".", ","));
        field.css("background-color", "#CC3333");
        updateError(screenExercise);
        updateEnergy(screenExercise);
      }
      
      field = $("#K-bottom-ex" + screenExercise);
      user_answer = parseFloat(field.val().replace(",", "."));
      right_answer = ai.getMassa() * Math.pow(ai.getComprimento() * ai.getVelocidade(), 2) / 2;
       
      console.log("------- K na base");
      console.log("Usuário: " + user_answer);
      console.log("Resposta esperada: " + right_answer);
           
      if (Math.abs(user_answer - right_answer) <= 0.22 * Math.abs(right_answer)) {
        currentScore += SCORE_UNIT;
        field.css("background-color", "#33CC33");
      }
      else {
        success = false;
        field.val(right_answer.toFixed(1).replace(".", ","));
        field.css("background-color", "#CC3333");
        updateError(screenExercise);
        updateEnergy(screenExercise);
      }
      
      if (success) {
        $("#feedback-ex" + screenExercise).html('Correto!');
        $("#feedback-ex" + screenExercise).removeClass().addClass("right-answer");
      }
      else {
        $("#feedback-ex" + screenExercise).html("Ao menos uma de suas respostas estava incorreta (campos destacados em vermelho). Elas foram automaticamente substituídas pela resposta certa.");
        $("#feedback-ex" + screenExercise).removeClass().addClass("wrong-answer");
      }   
    
      break;
      
    // Avalia a nota dos exercícios 3 e 6
    // ----------------------------------
    case 3:
    case 6:
      
      var success = true;
    
      var angle = (screenExercise == 3 ? 10 : 90);
      var field = $("#U-top-ex" + screenExercise);
      var user_answer = parseFloat(field.val().replace(",", "."));
      var right_answer = ai.getMassa() * ai.getGravidade() * ai.getComprimento() * (1 - Math.cos(angle * Math.PI / 180));
      
      console.log("------- U no topo");
      console.log("Usuário: " + user_answer);
      console.log("Resposta esperada: " + right_answer);
      
      if (Math.abs(user_answer - right_answer) <= 0.05 * Math.abs(right_answer)) {
        currentScore += SCORE_UNIT;
        field.css("background-color", "#33CC33");
      }
      else {
        success = false;
        field.val(right_answer.toFixed(1).replace(".", ","));
        field.css("background-color", "#CC3333");
        updateError(screenExercise);
        updateEnergy(screenExercise);
      }
      
      field = $("#K-top-ex" + screenExercise);
      user_answer = parseFloat(field.val().replace(",", "."));
      right_answer = 0;
      
      console.log("------ K no topo");
      console.log("Usuário: " + user_answer);
      console.log("Resposta esperada: " + right_answer);
            
      if (Math.abs(user_answer - right_answer) <= 0.05 * Math.abs(right_answer)) {
        currentScore += SCORE_UNIT;
        field.css("background-color", "#33CC33");
      }
      else {
        success = false;
        field.val(right_answer.toFixed(1).replace(".", ","));
        field.css("background-color", "#CC3333");
        updateError(screenExercise);
        updateEnergy(screenExercise);
      }            
            
      field = $("#U-bottom-ex" + screenExercise);
      user_answer = parseFloat(field.val().replace(",", "."));
      right_answer = 0;
      
      console.log("------ U na base");
      console.log("Usuário: " + user_answer);
      console.log("Resposta esperada: " + right_answer);
      
      if (Math.abs(user_answer - right_answer) <= 0.05 * Math.abs(right_answer)) {
        currentScore += SCORE_UNIT;
        field.css("background-color", "#33CC33");
      }
      else {
        success = false;
        field.val(right_answer.toFixed(1).replace(".", ","));
        field.css("background-color", "#CC3333");
        updateError(screenExercise);
        updateEnergy(screenExercise);
      }
      
      field = $("#K-bottom-ex" + screenExercise);
      user_answer = parseFloat(field.val().replace(",", "."));
      right_answer = ai.getMassa() * ai.getGravidade() * ai.getComprimento() * Math.pow(angle * Math.PI / 180, 2) / 2;
          
      console.log("------ U na base");
      console.log("Usuário: " + user_answer);
      console.log("Resposta esperada: " + right_answer);
        
      if (Math.abs(user_answer - right_answer) <= 0.05 * Math.abs(right_answer)) {
        currentScore += SCORE_UNIT;
        field.css("background-color", "#33CC33");
      }
      else {
        success = false;
        field.val(right_answer.toFixed(1).replace(".", ","));
        field.css("background-color", "#CC3333");
        updateError(screenExercise);
        updateEnergy(screenExercise);
      }
      
      if (success) {
        $("#feedback-ex" + screenExercise).html('Correto!');
        $("#feedback-ex" + screenExercise).removeClass().addClass("right-answer");
      }
      else {
        $("#feedback-ex" + screenExercise).html("Ao menos uma de suas respostas estava incorreta (campos destacados em vermelho). Elas foram automaticamente substituídas pela resposta certa.");
        $("#feedback-ex" + screenExercise).removeClass().addClass("wrong-answer");
      }
        
      $("#follow-up-ex" + screenExercise).show();
          
      break;
  }
  
  // Atualiza a nota do LMS (apenas se a questão respondida é aquela esperada pelo LMS)
  if (!completed && screenExercise == scormExercise) {
    score = Math.max(0, Math.min(Math.round(score + currentScore), 100));
    
    if (scormExercise < N_EXERCISES) {
      nextExercise();
    }
    else {
      completed = true;
      scormExercise = 1;
      save2LMS();
      scorm.quit();
    }
  }
}

/*
 * Atualiza o campo da energia mecânica (= U + K).
 */ 
function update (exercise, checkpoint) {

  var field = $("#U-" + checkpoint + "-ex" + exercise);
  var u = parseFloat(field.val().replace(",", "."));
  if (isNaN(u)) {
    u = 0;
    field.val(0);
  }
  
  field = $("#K-" + checkpoint + "-ex" + exercise);
  var k = parseFloat(field.val().replace(",", "."));
  if (isNaN(k)) {
    k = 0;
    field.val(0);
  }
 
  $("#E-" + checkpoint + "-ex" + exercise).html((u + k).toString().replace(".", ","));
  
  updateError(exercise);
}

/*
 * Atualiza a incerteza na energia.
 */ 
function updateError (exercise) {
                                 
  var field = $("#U-top-ex" + exercise);
  var u = parseFloat(field.val().replace(",", "."));
  if (isNaN(u)) {
    u = 0;
    field.val(0);
  }
  
  field = $("#K-bottom-ex" + exercise);
  var k = parseFloat(field.val().replace(",", "."));
  if (isNaN(k)) {
    k = 0;
    field.val(0);
  }
  
  if (u == 0 || k == 0) {
    $("#error-ex" + exercise).html("indefinida."); 
  }
  else {
    $("#error-ex" + exercise).html(Math.round(Math.abs(100 * (u - k) / u)).toFixed(1).replace(".", ",") + "%");
  }
}

function updateEnergy (exercise) {
             
  var field = $("#U-top-ex" + exercise);
  var u = parseFloat(field.val().replace(",", "."));
  if (isNaN(u)) {
    u = 0;
    field.val(0);
  }
  
  field = $("#K-top-ex" + exercise);
  var k = parseFloat(field.val().replace(",", "."));
  if (isNaN(k)) {
    k = 0;
    field.val(0);
  }
  
  $("#E-top-ex" + exercise).html((u + k).toFixed(1).replace(".", ","));
   
  field = $("#U-bottom-ex" + exercise);
  u = parseFloat(field.val().replace(",", "."));
  if (isNaN(u)) {
    u = 0;
    field.val(0);
  }
  
  field = $("#K-bottom-ex" + exercise);
  k = parseFloat(field.val().replace(",", "."));
  if (isNaN(k)) {
    k = 0;
    field.val(0);
  }
  
  $("#E-bottom-ex" + exercise).html((u + k).toFixed(1).replace(".", ","));
}



var log = {};

log.trace = function (message) {
  if(window.console && window.console.firebug){
    console.log(message);
  }
  else {
    alert(message);
  }  
}

log.error = function (message) {
  if( (window.console && window.console.firebug) || console){
    console.error(message);
  }
  else {
    alert(message);
  }
}