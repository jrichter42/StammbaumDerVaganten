using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StammbaumDerVaganten
{
    public class MainViewModel
    {
        public Database Database;

        public ObservableCollection<Scout> Scouts
        {
            get { return Database.Data.Scouts; }
            set { Database.Data.Scouts = value; }
        }

        public ObservableCollection<Group> Groups
        {
            get { return Database.Data.Groups; }
            set { Database.Data.Groups= value; }
        }

        public ObservableCollection<Role> Roles
        {
            get { return Database.Data.Roles; }
            set { Database.Data.Roles = value; }
        }
        
        public MainViewModel()
        {
            Database = new Database();
            return;
            if (!Database.Load())
            {
                Log.Write(Log_Level.Error, "Failed to load Database");
            }

            if (!Database.Save())
            {
                Log.Write(Log_Level.Error, "Failed to save Database");
            }
        }

        public void Load()
        {
            Log.Write(Log_Level.Message, "Load triggert");
            Database.Load();
        }

        public void Save()
        {
            Log.Write(Log_Level.Message, "Save triggert");
            Database.Save();
        }
    }
}
