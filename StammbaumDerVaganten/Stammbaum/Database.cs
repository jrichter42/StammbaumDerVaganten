using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Runtime.Serialization;

namespace StammbaumDerVaganten
{
    [DataContract]
    public class Data
    {
        #region Serialization
        [DataMember]
        public ObservableCollection<Scout> _SCOUTS
        {
            get { return Scouts; }
            set { Scouts = value; }
        }
        [DataMember]
        public ObservableCollection<Group> _GROUPS
        {
            get { return Groups; }
            set { Groups = value; }
        }
        [DataMember]
        public ObservableCollection<Role> _ROLES
        {
            get { return Roles; }
            set { Roles = value; }
        }
        [DataMember]
        public ObservableCollection<Timepoint> _TIMEPOINTS
        {
            get { return Timepoints; }
            set { Timepoints = value; }
        }
        #endregion

        public ObservableCollection<Scout> Scouts;
        public ObservableCollection<Group> Groups;
        public ObservableCollection<Role> Roles;
        public ObservableCollection<Timepoint> Timepoints;

        public Data()
        {
            Scouts = new ObservableCollection<Scout>();
            Groups = new ObservableCollection<Group>();
            Roles = new ObservableCollection<Role>();
            Timepoints = new ObservableCollection<Timepoint>();
            Timepoint invalidTP = new Timepoint();
            invalidTP.ReassignID(Timepoint.ID_INVALID); //NEVER DO THIS!!! unless you know what you are doing
            invalidTP.Date.Year = 1;
            invalidTP.Name = "RESET";
            Timepoints.Add(invalidTP);
        }

        #region GetStuffByID
        public Group GetGroupByID(int groupID)
        {
            if (groupID == Group.ID_INVALID)
            {
                return null;
            }

            foreach (Group g in Groups)
            {
                if (g.ID == groupID)
                {
                    return g;
                }
            }

            return null;
        }

        public Role GetRoleByID(int roleID)
        {
            if (roleID == Role.ID_INVALID)
            {
                return null;
            }

            foreach (Role r in Roles)
            {
                if (r.ID == roleID)
                {
                    return r;
                }
            }

            return null;
        }

        public Timepoint GetTimepointyID(int timepointID)
        {
            if (timepointID == Timepoint.ID_INVALID)
            {
                return null;
            }

            foreach (Timepoint t in Timepoints)
            {
                if (t.ID == timepointID)
                {
                    return t;
                }
            }

            return null;
        }
        #endregion
    }

    public class Database
    {
        public Data Data;

        public Dictionary<int, Group> GroupIDMap;
        public Dictionary<int, Role> RoleIDMap;
        public Dictionary<int, Timepoint> TimepointIDMap;

        public Database()
        {
            Data = new Data();
        }

        public bool Load()
        {
            string dataStr = "";
            if (FileManager.Instance.Read(ref dataStr))
            {
                if (Serializer<Data>.Deserialize(dataStr, ref Data))
                {
                    return true;
                }
            }
            return false;
        }
            
        public bool Save(bool humanReadable = true)
        {
            string dataStr = "";
            if (Serializer<Data>.Serialize(ref dataStr, Data, humanReadable))
            {
                if (FileManager.Instance.Write(dataStr))
                {
                    return true;
                }
            }
            return false;
        }
    }
}
