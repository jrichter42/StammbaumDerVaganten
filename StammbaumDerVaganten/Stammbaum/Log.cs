using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Runtime.CompilerServices;

namespace StammbaumDerVaganten
{
    public enum Log_Level
    {
        Message,
        Warning,
        Error,
        Exception
    }

    public class Log
    {
        private static Log globalInstance = null;

        public static Log Global
        {
            get
            {
                if (globalInstance == null)
                {
                    globalInstance = new Log();
                }
                return globalInstance;
            }
        }


        protected List<string> history = new List<string>();
        
        public List<string> History
        {
            get { return history; }
        }

        public delegate void EntryAddedHandler(string author, string entry);

        public event EntryAddedHandler EntryAdded;

        public string HistoryTop
        {
            get
            {
                if (history.Count == 0)
                {
                    return "";
                }
                return history[history.Count - 1];
            }
        }

        public void Write(Log_Level level, string message, [CallerMemberName] string caller = "")
        {
            string timestamp = DateTime.Now.ToString() + "." + DateTime.Now.Millisecond;
            string output = string.Format("{0, -30}", timestamp) + " [" + Enum.GetName(typeof(Log_Level), level) + "] " + message;

            Debug.Print(output);
            history.Add(output);

            if (EntryAdded != null)
            {
                EntryAdded.Invoke(caller, output);
            }
        }

        public void Write(Exception e, [CallerMemberName] string caller = "")
        {
            Write(Log_Level.Exception, e.Message, caller);
        }
    }
}
