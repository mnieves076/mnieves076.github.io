<% @ CodePage=65001  LANGUAGE="JSCRIPT" %>

<%
	Response.Buffer=true;
	Response.Expires=0;
	Response.CacheControl="no-cache";
	Response.ContentType = "text/html";
	Response.Charset = "utf-8";	
	
	//***** Connect to the database	
	var dbConnectionString = "Driver={MySQL ODBC 3.51 Driver};Server=localhost;uid=magnamerc;pwd=reebok01;database=pindax_games;"
	var con = Server.CreateObject("ADODB.Connection");
	con.CommandTimeout = 20;
	con.open(dbConnectionString);
	
	var key = String(Request("key"));
	
	if(key == "undefined") {
		Response.write("ERROR_KEY_UNDEFINED");
		Response.end();
	}
	
	if(Session("app_id") == "undefined") {
		Response.write("ERROR_APP_ID_UNDEFINED");
		Response.end();
	}
	
	if(Session("fb_id") == "undefined") {
		Response.write("ERROR_FB_ID_UNDEFINED");
		Response.end();
	}
	
	var sql = "insert into achievement (app_id,fb_id,name) values ('" + Session("app_id") + "','" + Session("fb_id") + "','" + key + "')";
	
	try {
		con.execute(sql);
	} catch(e) {
		Response.write("ERROR_ON INSERT: " + sql);
		Response.end();
	}
	
	//****** Disconnect from database
	con.close();
	
	Response.write("SUCCESS");
%>