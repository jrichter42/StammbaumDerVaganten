using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
        public static void Write(Log_Level level, string message)
        {
            string output = "[" + Enum.GetName(typeof(Log_Level), level) + "] " + message;
            Debug.Print(output);
        }

        public static void Write(Exception e)
        {
            Write(Log_Level.Exception, e.Message);
        }
    }
}
