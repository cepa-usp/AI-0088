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
var MAX_INIT_TRIES = 60;
var init_tries = 0;
var debug = true;
var SCORE_UNIT = 100 / 24; //isso está certo? não seria o número de exercícios 100/6 ?
var state = {};
var currentScore = 0;
var exOk;

$(document).ready(init); // Inicia a AI.
$(window).unload(uninit); // Encerra a AI.

/*
 * Inicia a Atividade Interativa (AI)
 */
function init () {
  configAi();
  checkCallbacks();
}

/*
 * Encerra a Atividade Interativa (AI)
 */ 
function uninit () {
  if (!completed) {
    save2LMS();
    scorm.quit();
  }
}

function configAi () {
	
	var flashvars = {};
	flashvars.ai = "swf/AI-0088.swf";
	flashvars.width = "550";
	flashvars.height = "400";
	
	var params = {};
	params.menu = "false";
	params.scale = "noscale";

	var attributes = {};
	attributes.id = "ai";
	attributes.align = "middle";

	swfobject.embedSWF("swf/AI-0088.swf", "ai-container", flashvars.width, flashvars.height, "10.0.0", "expressInstall.swf", flashvars, params, attributes);
	
  //Deixa a aba "Orientações" ativa no carregamento da atividade
  $('#exercicios').tabs({ selected: 0 });

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
  
  //initSCORM();
  
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

  // Configurações dos botões em geral
  $('.check-button').button().click(evaluateExercise);
  $('.check-button2').button().click(evaluateExercise);

  
  //Começa com botão Próximo/Terminar desabilitado.
  $( ".check-button" ).button({ disabled: true });
  $( ".check-button2" ).button({ disabled: true });

}

function selectExercise (exercise) {
	switch(exercise) {
		case 1:
			console.log("Configurando o exercício 2");
			
			break;
			
		case 2:
			console.log("Configurando o exercício 2");

			break;
			
		case 3:
			console.log("Configurando o exercício 3");

			break;
			
		case 4:
			console.log("Configurando o exercício 4");
			

			break;
			
		case 5:
			console.log("Configurando o exercício 5");

			break;
		
		case 6:
			console.log("Configurando o exercício 6");

			break;
			
		default:
			console.log("Ops! Isto não devia tera acontecido!");
			break;
	}
}

function checkCallbacks () {
	var t2 = new Date().getTime();
	ai = document.getElementById("ai");
	try {
		ai.doNothing();
		message("swf ok!");
		iniciaAtividade();
	}
	catch(error) {
		++init_tries;
		
		if (init_tries > MAX_INIT_TRIES) {
			alert("Carregamento falhou.");
		}
		else {
			message("falhou");
			setTimeout("checkCallbacks()", 1000);
		}
	}
}

function getAi(){
	ai = document.getElementById("ai");
	iniciaAtividade();
}

// Inicia a AI.
function iniciaAtividade(){       
  
  //$('#reiniciar').button().click(reloadPage);
    
  //Textfields aceitam apenas número, ponto e vírgula.
  $('input').keyup(function(e) {
  
    var a = [];
    var k = e.which;
	    
    for (i = 44; i < 58; i++)
        a.push(i);
    
    if (!(a.indexOf(k)>=0))
        e.preventDefault();
	
	  
	var value01 = $("input[type=text][id=U-ex1]").val();
	var value02 = $("input[type=text][id=K-ex1]").val();
	var value03 = $("input[type=text][id=U-ex3]").val();
	var value04 = $("input[type=text][id=N-ex2]").val();
	var value05 = $("input[type=text][id=lower-sum-ex2]").val();
	var value06 = $("input[type=text][id=upper-sum-ex2]").val();
	var value07 = $("input[type=text][id=X-ex6]").val();
  
	//Habilitar Próximo
	if(screenExercise == 1){
		if(value01 != '' || value02 != '' ) {
			//Habilita botão de próximo no exercicio 1.
			if(!bt1ProxEnabled){
				$( ".next-button" ).button({ disabled: false });
				bt1ProxEnabled = true;
			}
		}
		if(value01 != '' && value02 != '' ) {
			//Habilita botão Terminar no exercicio 1.
				$( ".check-button" ).button({ disabled: false });
			
		}
	}
	if(screenExercise == 2) {
		if(value04 != '' && value05 != '' && value06 != '') {
		    //Habilita botão Terminei no exercicio 2.
			$( ".check-button2" ).button({ disabled: false });
	    }
	}
	if(screenExercise == 3) {
		if(value03 != '') {
			//Habilita botão de próximo no exercicio 3.
			if(!bt2ProxEnabled){
				$( ".check-button3" ).button({ disabled: false });
				bt2ProxEnabled = true;
			}
	    }
	}
	if(screenExercise == 6) {
		if(value07 != '') {
			//Habilita botão Terminei no exercicio 6.
			$( ".check-button6" ).button({ disabled: false });
	    }
	}
	
	
	
  });
  

  
  initAI();
  
}

var bt1ProxEnabled = false;
var bt2ProxEnabled = false;

/*
 * Inicia a conexão SCORM.
 */ 
function initAI () {
 
  // Conecta-se ao LMS
  var connected = scorm.init();
  
  // A tentativa de conexão com o LMS foi bem sucedida.
  if (connected) {
  
  	if(scorm.get("cmi.mode") != "normal") return;
	scorm.set("cmi.exit","suspend");
	
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
 * Avalia a resposta do aluno ao exercício atual. Esta função é executada sempre que ele pressiona "terminei".
 */ 
function evaluateExercise (event) {
  
  // Avalia a nota
  var currentScore = getScore(screenExercise);
  score += currentScore / N_EXERCISES;
  
  if(exOk == false) return;
  console.log(screenExercise + "\t" + currentScore);
  // Mostra a mensagem de erro/acerto
  feedback(screenExercise, currentScore);
 
  // Atualiza a nota do LMS (apenas se a questão respondida é aquela esperada pelo LMS)
  if (!completed && screenExercise == scormExercise) {
    score = Math.max(0, Math.min(score + currentScore, 100));
    
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
 * Prepara o próximo exercício.
 */ 
function nextExercise () {
  if (scormExercise < N_EXERCISES) ++scormExercise;
  
  $('#exercicios').tabs("enable", scormExercise);
}

var TOLERANCE = 0.01;

function evaluate (user_answer, right_answer, tolerance) {
	return Math.abs(user_answer - right_answer) <= tolerance * Math.abs(right_answer);
}


/*
 * Avalia a resposta do aluno ao exercício atual. Esta função é executada sempre que ele pressiona "terminei".
 */ 
function getScore (exercise) {

  ans = 0;
  exOk = true;
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
      		ans = Math.round(ans);
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
    		ans = Math.round(ans);
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
          		ans = Math.round(ans);
      break;
	    
  }
  return ans;
}
 
/*
 * Exibe a mensagem de erro/acerto (feedback) do aluno para um dado exercício e nota (naquele exercício).
 */ 
function feedback (exercise, score) {
                       
  switch (exercise) {

    // Feedback da resposta ao exercício 1
    case 1:	
      if (score == 100) {
          $('#message1').html('Resposta correta!').removeClass().addClass("right-answer");
      } else {
			//var lower_sum = Number(ai.get("LOWER_SUM")).toFixed(2).replace(".", ",");	
			//var upper_sum = Number(ai.get("UPPER_SUM")).toFixed(2).replace(".", ",");  
			
			
			var src = "img/int_ex1_red.gif";
                       
						
            $('#message1').html('O correto seria: ' + lower_sum + '  <img style="vertical-align:middle;" src=' + src + '></img>  ' + upper_sum +'.').removeClass().addClass("wrong-answer");
        }
      
      break;
    
    // Feedback da resposta ao exercício 2
    case 2:
      if (score == 100) {
          $('#message2').html('Resposta correta!').removeClass().addClass("right-answer");
      } else {
			var N_number = Number(ai.get("N")).toFixed(0).replace(".", ",");			
			var lower_sum = Number(ai.get("LOWER_SUM")).toFixed(2).replace(".", ",");	
			var upper_sum = Number(ai.get("UPPER_SUM")).toFixed(2).replace(".", ",");
					      
          $('#message2').html('O correto seria: para N = ' + N_number + ', a soma inferior é igual a ' + lower_sum + ' e a soma superior é ' + upper_sum +'.').removeClass().addClass("wrong-answer");
      }
      break;
	  
    // Feedback da resposta ao exercício 3
    case 3:
      if (score == 100) {
          $('#message3').html('Resposta correta!').removeClass().addClass("right-answer");
		  document.getElementById('frame03').style.display="block";
      } else {
		  var resposta = Number(ai.get("AREA")).toFixed(2).replace(".", ",");	
			      
          $('#message3').html('O correto seria ' + resposta +'.').removeClass().addClass("wrong-answer");
		  document.getElementById('frame03').style.display="block";
      }
      
      break;	  

    // Feedback da resposta ao exercício 4
    case 4:
	  if (score == 100) {
          $('#message4').html('Resposta correta!').removeClass().addClass("right-answer");
      } else {
		  var resposta = Number(ai.get("FUNCTION_VALUE", ai.get("M"))).toFixed(2).replace(".", ",");
          var correto = Number(ai.get("MEAN_VALUE")).toFixed(2).replace(".", ",");
		  
		  ai.set("M",ai.get("FUNCTION_INVERSE", correto));
			      
          $('#message4').html('Sua resposta foi M = ' + resposta + ', mas o correto seria ' + correto + ' (veja na figura acima: eu reposicionei M no local correto).').removeClass().addClass("wrong-answer");
      }
	
      break;
	  
    // Feedback da resposta ao exercício 5
    case 5:   	
	var valor1 = document.selects.ex5_select_01.value; 
	var valor2 = document.selects.ex5_select_02.value;
	var valor3 = document.selects.ex5_select_03.value;
	var valor4 = document.selects.ex5_select_04.value;
	if (valor1 == 'menor') {document.getElementById('feedback5-a').style.display="block";}
	if (valor2 == 'maior') {document.getElementById('feedback5-b').style.display="block";}
	if (valor3 == 'menor') {document.getElementById('feedback5-c').style.display="block";}	
	if (valor4 == 'menor') {document.getElementById('feedback5-d').style.display="block";}
      if (valor1 == 'menor') {
		  document.getElementById('feedback5-a').style.display="block";
          $('#message5a').html('O correto seria: >').removeClass().addClass("wrong-answer");
      } else {      
	      $('#message5a').html('Resposta correta!').removeClass().addClass("right-answer");
      }
	  if (valor2 == 'maior') {
	      document.getElementById('feedback5-b').style.display="block"; 
          $('#message5b').html('O correto seria: <').removeClass().addClass("wrong-answer");
      } else {      
	      $('#message5b').html('Resposta correta!').removeClass().addClass("right-answer");
      }
	  if (valor3 == 'menor') {
	      document.getElementById('feedback5-c').style.display="block";
          $('#message5c').html('O correto seria: >').removeClass().addClass("wrong-answer");
      } else {      
	      $('#message5c').html('Resposta correta!').removeClass().addClass("right-answer");
      }
	  if (valor4 == 'menor') {
	      document.getElementById('feedback5-d').style.display="block";
          $('#message5d').html('O correto seria: >').removeClass().addClass("wrong-answer");
      } else {      
	      $('#message5d').html('Resposta correta!').removeClass().addClass("right-answer");
      }
	   
      break;
	  
    // Feedback da resposta ao exercício 6
    case 6:
      if (score == 100) {
          $('#message6').html('Resposta correta!').removeClass().addClass("right-answer");
      } else {
		  
			      
          $('#message6').html('O correto seria ' + resposta +'.').removeClass().addClass("wrong-answer");
      }
      
      break;
  }
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

// Mensagens de log
function message (m) {
	try {
		if (debug) console.log(m);
	}
	catch (error) {
		// Nada.
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