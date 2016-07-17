using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;

namespace StammbaumDerVaganten
{
    public class MainViewModel
    {
        public static MainViewModel ActiveVM = null;

        public static Data ActiveData
        {
            get
            {
                if (ActiveVM == null || ActiveVM.Database == null)
                {
                    return null;
                }

                return ActiveVM.Database.Data;
            }
        }

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

        public ObservableCollection<Timepoint> Timepoints
        {
            get { return Database.Data.Timepoints; }
            set { Database.Data.Timepoints = value; }
        }

        protected ObservableCollection<Membership> selectedMemberships = null;
        protected ObservableCollection<Activity> selectedActivities = null;

        public ObservableCollection<Membership> Memberships
        {
            get { return selectedMemberships; }
            set { selectedMemberships = value; }
        }

        public ObservableCollection<Activity> Activities
        {
            get { return selectedActivities; }
            set { selectedActivities = value; }
        }

        public void FlushMemberActivityLists()
        {
            Memberships = null;
            Activities = null;
        }

        public MainViewModel()
        {
            Database = new Database();
        }

        public void Load()
        {
            Log.Write(Log_Level.Message, "Load triggert");
            if (!Database.Load())
            {
                Log.Write(Log_Level.Error, "Failed to load Database");
            }
        }

        public void Save()
        {
            Log.Write(Log_Level.Message, "Save triggert");
            if (!Database.Save())
            {
                Log.Write(Log_Level.Error, "Failed to save Database");
            }
        }
    }
}
