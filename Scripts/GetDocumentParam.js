//Get document parameters (query portion of the URL)
function GetDocumentParam(ParamName, Default)
{
	//If the query string has already been parsed, just return the parameter
	if(window.DocumentParams!==undefined)
		return GetDocumentParamReal(ParamName, Default);

	//Parse the parameters
	var Params={}, SplitParams=document.location.search.substr(1).split(/&/);
	if(SplitParams.length>1 || SplitParams[0]!='') //Nothing to parse on empty string
		for(var i=0;i<SplitParams.length;i++)
		{
			var Parts=SplitParams[i].split(/=/, 2);
			Params[decodeURIComponent(Parts[0])]=decodeURIComponent(Parts[1]);
		}
	window.DocumentParams=Params; //Store globally

	//Return the parameter
	return GetDocumentParamReal(ParamName, Default);
}
function GetDocumentParamReal(ParamName, Default) { return (window.DocumentParams[ParamName]!==undefined ? window.DocumentParams[ParamName] : Default); } //If parameter does not exist, return the given default