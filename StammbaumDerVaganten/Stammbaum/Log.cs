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
        protected static ObservableCollection<string> history = new ObservableCollection<string>();
        
        public static ObservableCollection<string> History
        {
            get { return history; }
        }

        public delegate void EntryAddedHandler(string author, string entry);

        public static event EntryAddedHandler EntryAdded;

        public static string HistoryTop
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


        public static void Write(Log_Level level, string message, [CallerMemberName] string caller = "")
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

        public static void Write(Exception e, [CallerMemberName] string caller = "")
        {
            Write(Log_Level.Exception, e.Message, caller);
        }
    }
}
