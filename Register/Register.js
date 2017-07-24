$(document).ready(function() {
	//Select the plan the user gave
	$('#PaymentPlan').val(GetDocumentParam('Plan')==8 ? 8 : 2);

	//Add age groups
	$.each(['<12', '12-14', '15-20', '21-35', '36-50', '51-65', '66+'], function(_, Val) {
		$('<option>').val(Val).text(Val).appendTo('#Field_AgeGroup');
	});

	//Form submission
	var IsSubmitting=false;
	$('#QuestionForm').submit(function(e) {
		e.preventDefault();

		//Inititate submission
		const QF=$(this);
		if(IsSubmitting)
			return;
		IsSubmitting=true;
		QF.find('input,select').prop('disabled', true).addClass('Disabled');
		$('#Errors').hide().children().remove();

		//Get the fields to send
		var SubmitFields={Action:'Submit'};
		QF.find('.Questions').find('input,select').each(function() {
			//Get the field name
			var F=$(this), FieldName=F.attr('id').substr('Field_'.length);

			//Get the type of the element
			var Type='text';
			if(F.is('select'))
				Type='select';
			if(['checkbox', 'radio'].indexOf(F.attr('type'))!=-1)
				Type=F.attr('type');

			//Get the value
			var Val=null;
			switch(Type) {
				case 'text': Val=F.val(); break;
				case 'select': Val=F.val(); Val=(Val===null ? '' : Val); break;
				case 'checkbox': Val=F.is(':checked') ? 1 : 0; break;
				case 'radio': FieldName=F.attr('name'); if(F.is(':checked')) Val=F.val(); break;
			}

			//Store the value
			if(Val!==null)
				SubmitFields[FieldName]=Val;
		});

		//Submit the data
		new DWCFRequest(SubmitFields, function(RetData, ErrorCode) {
			IsSubmitting=false;
			QF.find('input,select').prop('disabled', false).removeClass('Disabled');

			//On success, forward to new page
			if(!ErrorCode)
				return document.location.href='../RegisterSuccess';

			//If non-form error has already thrown, nothing to do
			if(ErrorCode!=this.ErrorCodes.ResultNotSuccessful)
				return;

			//Create the error data
			var ErrorElements=[];
			if(typeof(RetData.Errors)==='string')
			{
				ErrorElements.push($('<div>').html(RetData.Errors));
				RetData.Errors=[];
			}
			$.each(RetData.Errors, function() {
				ErrorElements.push($('<div>').append([
					GetTranslation('Register', this[0], true, 'Field_'+this[0]),
					$('<span>').text(': '),
					typeof(this[1])==='string' ? GetTranslation('Register', this[1], true, 'Error_'+this[1]) : $('<span>').html(this[1][0]),
				]));
			});

			//Add the error elements to the error box
			$('#Errors').append(ErrorElements).show();
		}, {Name:'Submit', URL:'./Register-Submit.php'});
	});
});