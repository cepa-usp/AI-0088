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
	flashvars.width = "700";
	flashvars.height = "500";
	
	var params = {};
	params.menu = "false";
	params.scale = "noscale";

	var attributes = {};
	attributes.id = "ai";
	attributes.align = "middle";

	swfobject.embedSWF("swf/AI-0088.swf", "ai-container", flashvars.width, flashvars.height, "10.0.0", "expressInstall.swf", flashvars, params, attributes);
	
  //Deixa a aba "Orientações" ativa no carregamento da atividade
  $('#exercicios').tabs({ selected: 0 });
  
  $("#follow-up-ex2").hide();
  $("#follow-up-ex3").hide();
  $("#follow-up-ex6").hide();
    
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
  $('.check-button3').button().click(evaluateExercise);
  $('.check-button4').button().click(evaluateExercise);
  $('.check-button5').button().click(evaluateExercise);
  $('.check-button6').button().click(evaluateExercise);

  
  //Começa com botão Próximo/Terminar desabilitado.
  $( ".check-button" ).button({ disabled: true });
  $( ".check-button2" ).button({ disabled: true });
  $( ".check-button3" ).button({ disabled: true });
  $( ".check-button4" ).button({ disabled: true });
  $( ".check-button5" ).button({ disabled: true });
  $( ".check-button6" ).button({ disabled: true });

}

var debug = true; 

function selectExercise (exercise) {
	switch(exercise) {
		case 1:
			console.log("Configurando o exercício 1");
				
			//MODO DE DEBUG
			if(debug){
				angle = (screenExercise == 1 ? 10 : 90);
				ra = ai.getMassa() * ai.getGravidade() * ai.getComprimento() * (1 - Math.cos(angle * Math.PI / 180));
				energy = ra;
				ra2 = 0;
				ra3 = 0;
				ra4 = energy;
				console.log("U-top: " + ra);
				console.log("K-top: " + ra2);
				console.log("U-base: " + ra3);
				console.log("K-base: " + ra4);
			}
			
			break;
			
		case 2:
			console.log("Configurando o exercício 2");
				ai.setTeta(10);
				ai.playAnimation();
				
			//MODO DE DEBUG
			if(debug){
				ra = ai.getMassa() * ai.getGravidade() * ai.getComprimento() * (1 - Math.cos(ai.getTeta() * Math.PI / 180));
				ra2 = 0;
				ra3 = 0;
				ra4 = ai.getMassa() * Math.pow(ai.getComprimento() * ai.getVelocidade(), 2) / 2;
				console.log("U-top: " + ra);
				console.log("K-top: " + ra3);
				console.log("U-base: " + ra2);
				console.log("K-base: " + ra4);		
			}

			break;
			
		case 3:
			console.log("Configurando o exercício 3");
				ai.setTeta(10);
				ai.playAnimation();
			
			//MODO DE DEBUG
			if(debug){
				angle = (screenExercise == 3 ? 10 : 90);
				ra = ai.getMassa() * ai.getGravidade() * ai.getComprimento() * (1 - Math.cos(angle * Math.PI / 180));
				ra2 = 0;
				ra3 = 0;
				ra4 = ai.getMassa() * ai.getGravidade() * ai.getComprimento() * Math.pow(angle * Math.PI / 180, 2) / 2;
				console.log("U-top: " + ra);
				console.log("K-top: " + ra2);
				console.log("U-base: " + ra3);		
				console.log("K-base: " + ra4);
			}

			break;
			
		case 4:
			console.log("Configurando o exercício 4");			
			angle = 0;
			
			//MODO DE DEBUG
			if(debug){
				angle = (screenExercise == 1 ? 10 : 90);
				ra = ai.getMassa() * ai.getGravidade() * ai.getComprimento() * (1 - Math.cos(angle * Math.PI / 180));
				energy = ra;
				ra2 = 0;
				ra3 = 0;
				ra4 = energy;
				console.log("U-top: " + ra);
				console.log("K-top: " + ra2);
				console.log("U-base: " + ra3);
				console.log("K-base: " + ra4);
			}
			

			break;
			
		case 5:
			console.log("Configurando o exercício 5");
			ai.setTeta(90);
            ai.playAnimation();
			//MODO DE DEBUG
			if(debug){
				ra = ai.getMassa() * ai.getGravidade() * ai.getComprimento() * (1 - Math.cos(ai.getTeta() * Math.PI / 180));
				ra2 = 0;
				ra3 = 0;
				ra4 = ai.getMassa() * Math.pow(ai.getComprimento() * ai.getVelocidade(), 2) / 2;
				console.log("U-top: " + ra);
				console.log("K-top: " + ra3);
				console.log("U-base: " + ra2);
				console.log("K-base: " + ra4);		
			}

			break;
		
		case 6:
			console.log("Configurando o exercício 6");
			ai.setTeta(90);
            ai.playAnimation();
			//MODO DE DEBUG
			if(debug){
				angle = (screenExercise == 3 ? 10 : 90);
				ra = ai.getMassa() * ai.getGravidade() * ai.getComprimento() * (1 - Math.cos(angle * Math.PI / 180));
				ra2 = 0;
				ra3 = 0;
				ra4 = ai.getMassa() * ai.getGravidade() * ai.getComprimento() * Math.pow(angle * Math.PI / 180, 2) / 2;
				console.log("U-top: " + ra);
				console.log("K-top: " + ra2);
				console.log("U-base: " + ra3);		
				console.log("K-base: " + ra4);
			}

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
		selectExercise(screenExercise);		
      }
  });

  //Textfields aceitam apenas número, ponto e vírgula.
  $('input').keypress(function(e) {
	var a = [];
    var k = e.which;
    
    for (i = 44; i < 58; i++)
		if (i != 47) a.push(i)
    
        if (!($.inArray(k,a)>=0))
            e.preventDefault();
  });
  
  $('input').keyup(function(e) {
  
    var a = [];
    var k = e.which;
	    
    for (i = 44; i < 58; i++)
        a.push(i);
    
    if (!(a.indexOf(k)>=0))
        e.preventDefault();


	value01 = $("#K-top-ex" + screenExercise).val();
	value02 = $("#K-bottom-ex" + screenExercise).val();
	value03 = $("#U-top-ex" + screenExercise).val();
	value04 = $("#U-bottom-ex" + screenExercise).val();
	  
	//Habilitar Próximo
	if(screenExercise == 1){
		if(value01 != '' || value02 != '' || value03 != '' || value04 != '') {
			//Habilita botão Terminar no exercicio 1.
				$( ".check-button" ).button({ disabled: false });
			
		}
	}
	if(screenExercise == 2) {
		if(value01 != '' || value02 != '' || value03 != '' || value04 != '') {
		    //Habilita botão Terminei no exercicio 2.
			$( ".check-button2" ).button({ disabled: false });
	    }
	}
	if(screenExercise == 3) {
		if(value01 != '' || value02 != '' || value03 != '' || value04 != '') {
			//Habilita botão de próximo no exercicio 3.
			$( ".check-button3" ).button({ disabled: false });
	    }
	}
	if(screenExercise == 4) {
		if(value01 != '' || value02 != '' || value03 != '' || value04 != '') {
			//Habilita botão de próximo no exercicio 4.
			$( ".check-button4" ).button({ disabled: false });
	    }
	}
	if(screenExercise == 5) {
		if(value01 != '' || value02 != '' || value03 != '' || value04 != '') {
			//Habilita botão de próximo no exercicio 5.
			$( ".check-button5" ).button({ disabled: false });
	    }
	}
	if(screenExercise == 6) {
		if(value01 != '' || value02 != '' || value03 != '' || value04 != '') {
			//Habilita botão de próximo no exercicio 6.
			$( ".check-button6" ).button({ disabled: false });
	    }
	}
  });
  initAI();
}

/*
 * Inicia a conexão SCORM.
 */ 
function initAI () {
 
  // Conecta-se ao LMS
  var connected = scorm.init();
  
  // A tentativa de conexão com o LMS foi bem sucedida.
  if (connected) {
	
	var mode = scorm.get("cmi.mode");
	if(mode == "normal") scorm.set("cmi.credit", "credit")
	else scorm.set("cmi.credit", "no-credit");
	
    // Verifica se a AI já foi concluída.
    var completionstatus = scorm.get("cmi.completion_status");
    
    // A AI já foi concluída.
    switch (completionstatus) {
    
      // Primeiro acesso à AI
      case "not attempted":
      case "unknown":
      default:
        completed = false;
        scormExercise = 1;
        score = 0;
        
        $("#completion-message").removeClass().addClass("completion-message-off");    
        break;
        
      // Continuando a AI...
      case "incomplete":
        completed = false;
        
        scormExercise = parseInt(scorm.get("cmi.location"));
        score = parseInt(scorm.get("cmi.score.raw"));
        $("#completion-message").removeClass().addClass("completion-message-off");
        break;
        
      // A AI já foi completada.
      case "completed":
        completed = true;
        scormExercise = parseInt(scorm.get("cmi.location"));
        score = parseInt(scorm.get("cmi.score.raw"));
        
        $("#completion-message").removeClass().addClass("completion-message-on");
        break;
    }
    
    if (isNaN(scormExercise)) scormExercise = 1;
    if (isNaN(score)) score = 0;
	
	scorm.set("cmi.score.min", 0);
	scorm.set("cmi.score.max", 100);
	
	// Posiciona o aluno no exercício da vez
    screenExercise = scormExercise;
    $('#exercicios').tabs("select", scormExercise - 1);  
    
    pingLMS();
    
  }
  // A tentativa de conexão com o LMS falhou.
  else {
    completed = false;
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
  
	if(scorm.get("cmi.mode") != "normal") return;
  
    // Salva no LMS a nota do aluno.
    var success = scorm.set("cmi.score.raw", score);
  
    // Notifica o LMS que esta atividade foi concluída.
    success = scorm.set("cmi.completion_status", (completed ? "completed" : "incomplete"));
	
	if (completed) {
		scorm.set("cmi.exit", "normal");
	} else { 
		scorm.set("cmi.exit","suspend");
	}
	
    success = scorm.set("cmi.success_status", (score > 75 ? "passed" : "failed"));
    
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
    //score = Math.max(0, Math.min(score, 100));
    
    if (scormExercise < N_EXERCISES) {
      nextExercise();
    }
    else {
		score += 50;
		score = Math.round(score);
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

var TOLERANCE = 0.05;

function evaluate (user_answer, right_answer, tolerance) {
	return Math.abs(user_answer - right_answer) <= tolerance * Math.abs(right_answer);
}

/*
 * Avalia a resposta do aluno ao exercício atual. Esta função é executada sempre que ele pressiona "terminei".
 */ 
function getScore (exercise) {

  ans = 0;
  var angle = 0;

  switch (exercise) {
  
    // Avalia a nota dos exercícios 1 e 4.
    case 1:
    case 4:
    default:		
		//desabilitar caixas de texto, botão Terminei.
		$( ".check-button" + screenExercise).button({ disabled: true });
		$("#U-top-ex" + screenExercise).attr("disabled",true);
        $("#K-top-ex" + screenExercise).attr("disabled",true);
		$("#U-bottom-ex" + screenExercise).attr("disabled",true);
		$("#K-bottom-ex" + screenExercise).attr("disabled",true);
		
		field = $("#U-top-ex" + screenExercise);
		field2 = $("#Ur-top-ex" + screenExercise);
		var angle = (screenExercise == 1 ? 10 : 90);
		var user_answer = parseFloat(field.val().replace(",", "."));
		var right_answer = ai.getMassa() * ai.getGravidade() * ai.getComprimento() * (1 - Math.cos(angle * Math.PI / 180));
		var energy = right_answer;
      
		//****** U ******//      
		if (evaluate(user_answer, right_answer, TOLERANCE)) {
			ans += 100/4;	
			field.css("background-color", "#66CC33");
			field2.val(right_answer.toFixed(1).replace(".", ","));
        } 
        /*if (screenExercise == 1) state.u_top_ex1 = user_answer;
			else state.u_top_ex4 = user_answer;
		}*/
		else {
        field2.val(right_answer.toFixed(1).replace(".", ","));
		field2.css("background-color", "#66CC33");
        field.css("background-color", "#FA5858");
        updateError(screenExercise);
        updateEnergy(screenExercise);
		}
		
		field = $("#U-bottom-ex" + screenExercise);
		field2 = $("#Ur-bottom-ex" + screenExercise);
		user_answer = parseFloat(field.val().replace(",", "."));
		right_answer = 0;
      
		if (evaluate(user_answer, right_answer, TOLERANCE)) {
			ans += 100/4;	
			field.css("background-color", "#66CC33");
			field2.val(right_answer.toFixed(1).replace(".", ","));
        } 
		else {
			field2.val(right_answer.toFixed(1).replace(".", ","));
			field2.css("background-color", "#66CC33");
			field.css("background-color", "#FA5858");
			updateError(screenExercise);
			updateEnergy(screenExercise);
		}
	  
		//****** K ******//     
		field = $("#K-top-ex" + screenExercise);
		field2 = $("#Kr-top-ex" + screenExercise);
		user_answer = parseFloat(field.val().replace(",", "."));
		right_answer = 0;
				
		if (evaluate(user_answer, right_answer, TOLERANCE)) {
			ans += 100/4;	
			field.css("background-color", "#66CC33");
			field2.val(right_answer.toFixed(1).replace(".", ","));
        } 
		else {
			field2.val(right_answer.toFixed(1).replace(".", ","));
			field2.css("background-color", "#66CC33");
			field.css("background-color", "#FA5858");
			updateError(screenExercise);
			updateEnergy(screenExercise);
		}  
        
		field = $("#K-bottom-ex" + screenExercise);
		field2 = $("#Kr-bottom-ex" + screenExercise);
		user_answer = parseFloat(field.val().replace(",", "."));
		right_answer = energy;
			   
		if (evaluate(user_answer, right_answer, TOLERANCE)) {
			ans += 100/4;	
			field.css("background-color", "#66CC33");
			field2.val(right_answer.toFixed(1).replace(".", ","));
		} 
		 else {
			field2.val(right_answer.toFixed(1).replace(".", ","));
			field2.css("background-color", "#66CC33");
			field.css("background-color", "#FA5858");
			updateError(screenExercise);
			updateEnergy(screenExercise);
		}
    	ans = Math.round(ans);
    
	break;
      
    // Avalia a nota dos exercícios 2 e 5.
    case 2:
    case 5:
		field = $("#U-top-ex" + screenExercise);
		field2 = $("#Ur-top-ex" + screenExercise);
		var user_answer = parseFloat(field.val().replace(",", "."));
		var right_answer = ai.getMassa() * ai.getGravidade() * ai.getComprimento() * (1 - Math.cos(ai.getTeta() * Math.PI / 180));
      
	  	//desabilitar caixas de texto, botão Terminei.
		$( ".check-button" + screenExercise).button({ disabled: true });
		$("#U-top-ex" + screenExercise).attr("disabled",true);
        $("#K-top-ex" + screenExercise).attr("disabled",true);
		$("#U-bottom-ex" + screenExercise).attr("disabled",true);
		$("#K-bottom-ex" + screenExercise).attr("disabled",true);
		
		//****** U ******//
		if (evaluate(user_answer, right_answer, 0.22)) {
			ans += 100/4;	
			field.css("background-color", "#66CC33");
			field2.val(right_answer.toFixed(1).replace(".", ","));
		} 
		 else {
			field2.val(right_answer.toFixed(1).replace(".", ","));
			field2.css("background-color", "#66CC33");
			field.css("background-color", "#FA5858");
			updateError(screenExercise);
			updateEnergy(screenExercise);     
		}      
		
		field = $("#U-bottom-ex" + screenExercise);
		field2 = $("#Ur-bottom-ex" + screenExercise);
		user_answer = parseFloat(field.val().replace(",", "."));
		right_answer = 0;	
      
		if (evaluate(user_answer, right_answer, TOLERANCE)) {
			ans += 100/4;	
			field.css("background-color", "#66CC33");
			field2.val(right_answer.toFixed(1).replace(".", ","));
		} 
		 else {
			field2.val(right_answer.toFixed(1).replace(".", ","));
			field2.css("background-color", "#66CC33");
			field.css("background-color", "#FA5858");
			updateError(screenExercise);
			updateEnergy(screenExercise);     
		}      
		
		//****** K ******//  
		field = $("#K-top-ex" + screenExercise);
		field2 = $("#Kr-top-ex" + screenExercise);
		user_answer = parseFloat(field.val().replace(",", "."));
		right_answer = 0;
            
		if (evaluate(user_answer, right_answer, TOLERANCE)) {
			ans += 100/4;	
			field.css("background-color", "#66CC33");
			field2.val(right_answer.toFixed(1).replace(".", ","));
		} 
		 else {
			field2.val(right_answer.toFixed(1).replace(".", ","));
			field2.css("background-color", "#66CC33");
			field.css("background-color", "#FA5858");
			updateError(screenExercise);
			updateEnergy(screenExercise);     
		}      
		
		field = $("#K-bottom-ex" + screenExercise);
		field2 = $("#Kr-bottom-ex" + screenExercise);
		user_answer = parseFloat(field.val().replace(",", "."));
		right_answer = ai.getMassa() * Math.pow(ai.getComprimento() * ai.getVelocidade(), 2) / 2;
           
 		if (evaluate(user_answer, right_answer, 0.22)) {
			ans += 100/4;	
			field.css("background-color", "#66CC33");
			field2.val(right_answer.toFixed(1).replace(".", ","));
		} 
		 else {
			field2.val(right_answer.toFixed(1).replace(".", ","));
			field2.css("background-color", "#66CC33");
			field.css("background-color", "#FA5858");
			updateError(screenExercise);
			updateEnergy(screenExercise);     
		}      
       
    	ans = Math.round(ans);
		
    break;
      
    // Avalia a nota dos exercícios 3 e 6
    // ----------------------------------
    case 3:
    case 6:
		var angle = (screenExercise == 3 ? 10 : 90);
		var field = $("#U-top-ex" + screenExercise);
		field2 = $("#Ur-top-ex" + screenExercise);
		var user_answer = parseFloat(field.val().replace(",", "."));
		var right_answer = ai.getMassa() * ai.getGravidade() * ai.getComprimento() * (1 - Math.cos(angle * Math.PI / 180));
		
		//desabilitar caixas de texto, botão Terminei.
		$( ".check-button" + screenExercise).button({ disabled: true });
		$("#U-top-ex" + screenExercise).attr("disabled",true);
        $("#K-top-ex" + screenExercise).attr("disabled",true);
		$("#U-bottom-ex" + screenExercise).attr("disabled",true);
		$("#K-bottom-ex" + screenExercise).attr("disabled",true);
      
		if (evaluate(user_answer, right_answer, TOLERANCE)) {
			ans += 100/4;
			field.css("background-color", "#66CC33");
			field2.val(right_answer.toFixed(1).replace(".", ","));
		}
		else {
			field2.val(right_answer.toFixed(1).replace(".", ","));
			field2.css("background-color", "#66CC33");
			field.css("background-color", "#FA5858");
			updateError(screenExercise);
			updateEnergy(screenExercise);
		}
      
		field = $("#K-top-ex" + screenExercise);
		field2 = $("#Kr-top-ex" + screenExercise);
		user_answer = parseFloat(field.val().replace(",", "."));
		right_answer = 0;
            
		if (evaluate(user_answer, right_answer, TOLERANCE)) {
			ans += 100/4;
			field.css("background-color", "#66CC33");
			field2.val(right_answer.toFixed(1).replace(".", ","));
		}
		else {
			field2.val(right_answer.toFixed(1).replace(".", ","));
			field2.css("background-color", "#66CC33");
			field.css("background-color", "#FA5858");
			updateError(screenExercise);
			updateEnergy(screenExercise);
		}            
            
		field = $("#U-bottom-ex" + screenExercise);
		field2 = $("#Ur-bottom-ex" + screenExercise);
		user_answer = parseFloat(field.val().replace(",", "."));
		right_answer = 0;
      
		if (evaluate(user_answer, right_answer, TOLERANCE)) {
			ans += 100/4;
			field.css("background-color", "#66CC33");
			field2.val(right_answer.toFixed(1).replace(".", ","));
		}
		else {
			field2.val(right_answer.toFixed(1).replace(".", ","));
			field2.css("background-color", "#66CC33");
			field.css("background-color", "#FA5858");
			updateError(screenExercise);
			updateEnergy(screenExercise);
		}
      
		field = $("#K-bottom-ex" + screenExercise);
		field2 = $("#Kr-bottom-ex" + screenExercise);
		user_answer = parseFloat(field.val().replace(",", "."));
		right_answer = ai.getMassa() * ai.getGravidade() * ai.getComprimento() * Math.pow(angle * Math.PI / 180, 2) / 2;
		
		if (evaluate(user_answer, right_answer, TOLERANCE)) {
			ans += 100/4;
			field.css("background-color", "#66CC33");
			field2.val(right_answer.toFixed(1).replace(".", ","));
		}
		else {
			field2.val(right_answer.toFixed(1).replace(".", ","));
			field2.css("background-color", "#66CC33");
			field.css("background-color", "#FA5858");
			updateError(screenExercise);
			updateEnergy(screenExercise);
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
			document.getElementById('respcerta1').style.display="block";
			//Coloca pendulo para oscilar 
			ai.setTeta(10);
            ai.playAnimation();
            $('#message1').html('Ao menos uma de suas respostas estava incorreta (campos destacados em vermelho).').removeClass().addClass("wrong-answer");
        }
      
      break;
    
    // Feedback da resposta ao exercício 2
    case 2:
      if (score == 100) {
          $('#message2').html('Resposta correta!').removeClass().addClass("right-answer");
      } else {
			document.getElementById('respcerta2').style.display="block";
			$('#follow-up-ex2').show();
			$('#message2').html('Ao menos uma de suas respostas estava incorreta (campos destacados em vermelho).').removeClass().addClass("wrong-answer");
      }
      break;
	  
    // Feedback da resposta ao exercício 3
    case 3:
      if (score == 100) {
          $('#message3').html('Resposta correta!').removeClass().addClass("right-answer");
      } else {
			document.getElementById('respcerta3').style.display="block";      
			$('#message3').html('Ao menos uma de suas respostas estava incorreta (campos destacados em vermelho).').removeClass().addClass("wrong-answer");
		  
      }
      
      break;	  

    // Feedback da resposta ao exercício 4
    case 4:
	  if (score == 100) {
          $('#message4').html('Resposta correta!').removeClass().addClass("right-answer");
      } else {			      
			document.getElementById('respcerta4').style.display="block";      
			$('#message4').html('Ao menos uma de suas respostas estava incorreta (campos destacados em vermelho).').removeClass().addClass("wrong-answer");
		  
      }
	
      break;
	  
    // Feedback da resposta ao exercício 5
    case 5:   	
	  if (score == 100) {
          $('#message5').html('Resposta correta!').removeClass().addClass("right-answer");
      } else {			      
			document.getElementById('respcerta5').style.display="block";      
			$('#message5').html('Ao menos uma de suas respostas estava incorreta (campos destacados em vermelho).').removeClass().addClass("wrong-answer");
		  
      }

      break;
	  
    // Feedback da resposta ao exercício 6
    case 6:
	  if (score == 100) {
          $('#message6').html('Resposta correta!').removeClass().addClass("right-answer");
      } else {			      
			document.getElementById('respcerta6').style.display="block";      
			$('#message6').html('Ao menos uma de suas respostas estava incorreta (campos destacados em vermelho).').removeClass().addClass("wrong-answer");
		  
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
  $("#Er-top-ex" + exercise).html((u + k).toFixed(1).replace(".", ","));
   
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
  $("#Er-bottom-ex" + exercise).html((u + k).toFixed(1).replace(".", ","));
}