<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- stylesheets -->
    <link rel="stylesheet" href="styles/css/bootstrap.min.css">
    <link rel="stylesheet" href="styles/fontawesome/css/all.min.css">
    <link rel="stylesheet" href="styles/css/style.css">

    <title>Install</title>
</head>

<body class="step_two_done">
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <h1 class="heading mt-5 mb-5 text-center">Installation</h1>
            </div>

            <div class="col-md-12">
                <!-- Steps -->
                <div class="install_step">
                    <ul class="install_steps">
                        <li class="step-one active">
                            <span>1
                                <i class="fas fa-check"></i>
                            </span>Terms of use
                        </li>

                        <li class="step-two ">
                            <span>2
                                <i class="fas fa-check"></i>
                            </span>Installation
                        </li>
                        <li class="step-three "><span>3
                            <i class="fas fa-check"></i>                            
                        </span>Finish</li>
                    </ul>
                    <div class="line">
                        <div class="line_sec"></div>
                    </div>
                </div>

                <!-- Step 1 -->
                <div class="contentWrap step1">
                    <h2 class="heading2">Terms of use</h2>

                    <h5 class="heading5">LICENSE AGREEMENT: one (1) Domain (site) Install</h5>

                    <p>
                        <b class="bold">You CAN:</b><br>
                        1) Use on one (1) domain only, additional license purchase required for each additional
                        domain.<br>
                        2) Modify or edit as you see fit.<br>
                        3) Delete sections as you see fit.<br>
                        4) Translate to your choice of language.<br> <br>

                        <b class="bold">You CANNOT:</b> <br>
                        1) Resell, distribute, give away or trade by any
                        means to any third party or individual without permission.<br>
                        2) Use on more than one
                        (1) domain.
                        <br><br>Unlimited Licenses are available.
                    </p>
                    <div class="formbox">
                        <form>
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input" id="agree" name="example1">
                                <label class="custom-control-label" for="agree">Check this custom checkbox</label>
                            </div>
                            <button type="submit" class="btn btn-main" id="next-terms" disabled="">Continue </button>
                        </form>
                    </div>
                </div>

                <!-- Step 2 (add class="step_two_done" in body)-->
                <div class="contentWrap step2">
                    <h2 class="heading2">Installation</h2>                    
                    <div class="formbox">
                        <form class="instalform">
                            <div class="form-group row">
                              <label class="col-sm-2 col-form-label col-form-label-sm" for="Purchasecode">Purchase code</label>
                              <div class="col-sm-10">
                                <input type="text" class="form-control" id="Purchasecode" placeholder="Purchase code">
                                <span class="form_error">code is not valid</span>
                              </div>
                            </div>
                            <div class="form-group row">
                                <label class="col-sm-2 col-form-label col-form-label-sm" for="SQLhostname">SQL host name</label>
                                <div class="col-sm-10">
                                  <input type="text" class="form-control" id="SQLhostname" placeholder="SQL host name">
                                </div>
                              </div>
                              <div class="form-group row">
                                <label class="col-sm-2 col-form-label col-form-label-sm" for="SQLusername">SQL username</label>
                                <div class="col-sm-10">
                                  <input type="text" class="form-control" id="SQLusername" placeholder="SQL username">
                                </div>
                              </div>
                              <div class="form-group row">
                                <label class="col-sm-2 col-form-label col-form-label-sm" for="SQLdatabasename">SQL database name</label>
                                <div class="col-sm-10">
                                  <input type="text" class="form-control" id="SQLdatabasename" placeholder="SQL database name">
                                </div>
                              </div>
                              <div class="form-group row">
                                <label class="col-sm-2 col-form-label col-form-label-sm" for="Siteurl">Site url</label>
                                <div class="col-sm-10">
                                  <input type="text" class="form-control" id="Siteurl" placeholder="Site url">
                                  <span class="help-block">Examples: <br>http://siteurl.com - http://www.siteurl.com - http://subdomain.siteurl.com - http://siteurl.com/subfolder<br> You can use https:// too.</span>
                                </div>
                              </div>
                              

                              <div class="form-group row">
                                <div class="col-sm-2">&nbsp;</div>
                                <div class="col-sm-10">
                                    <button type="submit" class="btn btn-main">Install</button>
                                </div>
                              </div>

                          </form>

                    </div>
                </div>

                <!-- Step 3 (add class="step_three_done" in body)-->
                <div class="contentWrap step3">
                    <h2 class="heading2">Finished installtion</h2>                    
                    
                </div>



            </div>
        </div>
    </div>


    <!-- Scripts -->
    <script src="scripts/jquery-3.4.1.min.js"></script>
    <script src="scripts/bootstrap.bundle.min.js"></script>
    <script>
        function Wo_SubmitButton() {
            $('button').attr('disabled', true);
            $('button').text('Please wait..');
            $('form').submit();
        }
        $(function () {
            $('#agree').change(function () {
                if ($(this).is(":checked")) {
                    $('#next-terms').attr('disabled', false);
                } else {
                    $('#next-terms').attr('disabled', true);
                }
            });
        });
    </script>


</body>

</html>
