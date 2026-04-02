using System;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace OrderMan;

public class AdminMaster : MasterPage
{
	private const string AntiXsrfTokenKey = "__AntiXsrfToken";

	private const string AntiXsrfUserNameKey = "__AntiXsrfUserName";

	private string _antiXsrfTokenValue;

	protected ContentPlaceHolder MainContent;

	protected void Page_Init(object sender, EventArgs e)
	{
		HttpCookie httpCookie = base.Request.Cookies["__AntiXsrfToken"];
		if (httpCookie != null && Guid.TryParse(httpCookie.Value, out var _))
		{
			_antiXsrfTokenValue = httpCookie.Value;
			Page.ViewStateUserKey = _antiXsrfTokenValue;
		}
		else
		{
			_antiXsrfTokenValue = Guid.NewGuid().ToString("N");
			Page.ViewStateUserKey = _antiXsrfTokenValue;
			HttpCookie httpCookie2 = new HttpCookie("__AntiXsrfToken")
			{
				HttpOnly = true,
				Value = _antiXsrfTokenValue
			};
			if (FormsAuthentication.RequireSSL && base.Request.IsSecureConnection)
			{
				httpCookie2.Secure = true;
			}
			base.Response.Cookies.Set(httpCookie2);
		}
		Page.PreLoad += master_Page_PreLoad;
	}

	protected void master_Page_PreLoad(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			ViewState["__AntiXsrfToken"] = Page.ViewStateUserKey;
			ViewState["__AntiXsrfUserName"] = Context.User.Identity.Name ?? string.Empty;
		}
		else if ((string)ViewState["__AntiXsrfToken"] != _antiXsrfTokenValue || (string)ViewState["__AntiXsrfUserName"] != (Context.User.Identity.Name ?? string.Empty))
		{
			throw new InvalidOperationException("Validation of Anti-XSRF token failed.");
		}
	}

	protected void Page_Load(object sender, EventArgs e)
	{
	}

	protected void Unnamed_LoggingOut(object sender, LoginCancelEventArgs e)
	{
		Context.GetOwinContext().Authentication.SignOut();
	}
}
